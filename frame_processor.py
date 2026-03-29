from config import BLIP_MODEL, DEVICE


def caption_frames(frames_with_timestamps: list) -> list:
    """
    Generate captions for each frame using BLIP.
    Returns list of {"caption": str, "timestamp": float}.
    """
    if not frames_with_timestamps:
        print("  No frames to caption.")
        return []

    print(f"Loading BLIP captioning model ({BLIP_MODEL})...")
    try:
        from transformers import BlipProcessor, BlipForConditionalGeneration
        import torch

        processor = BlipProcessor.from_pretrained(BLIP_MODEL)
        model = BlipForConditionalGeneration.from_pretrained(BLIP_MODEL)
        model = model.to(DEVICE)
        model.eval()
        use_blip = True
        print(f"  BLIP loaded on {DEVICE}")
    except Exception as e:
        print(f"  BLIP failed to load: {e}")
        print("  Falling back to CLIP-based description...")
        use_blip = False

    if use_blip:
        return _caption_with_blip(frames_with_timestamps, processor, model)
    else:
        return _caption_with_clip(frames_with_timestamps)


def _caption_with_blip(frames_with_timestamps, processor, model) -> list:
    import torch

    captions = []
    total = len(frames_with_timestamps)
    print(f"  Captioning {total} frames with BLIP...")

    for i, (image, timestamp) in enumerate(frames_with_timestamps):
        try:
            inputs = processor(images=image, return_tensors="pt").to(DEVICE)
            with torch.no_grad():
                output = model.generate(**inputs, max_new_tokens=50)
            caption = processor.decode(output[0], skip_special_tokens=True)
            captions.append({"caption": caption, "timestamp": timestamp})

            if (i + 1) % 10 == 0 or (i + 1) == total:
                print(f"    Captioned {i+1}/{total} frames")
        except Exception as e:
            print(f"    Warning: could not caption frame at {timestamp:.1f}s: {e}")

    print(f"  Generated {len(captions)} captions")
    return captions


def _caption_with_clip(frames_with_timestamps) -> list:
    """Fallback: use CLIP to match frames against candidate descriptions."""
    import torch
    from transformers import CLIPProcessor, CLIPModel
    from config import CLIP_MODEL

    print(f"  Loading CLIP model ({CLIP_MODEL})...")
    try:
        clip_processor = CLIPProcessor.from_pretrained(CLIP_MODEL)
        clip_model = CLIPModel.from_pretrained(CLIP_MODEL).to(DEVICE)
        clip_model.eval()
    except Exception as e:
        print(f"  CLIP also failed: {e}. Returning empty captions.")
        return []

    candidate_descriptions = [
        "a person talking", "a slide or presentation", "a chart or graph",
        "a person standing", "text on screen", "a whiteboard", "an interview",
        "a lecture", "outdoor scene", "indoor scene", "hands or gestures",
        "a computer screen", "multiple people", "a crowd",
    ]

    captions = []
    total = len(frames_with_timestamps)
    print(f"  Describing {total} frames with CLIP...")

    for i, (image, timestamp) in enumerate(frames_with_timestamps):
        try:
            inputs = clip_processor(
                text=candidate_descriptions,
                images=image,
                return_tensors="pt",
                padding=True
            ).to(DEVICE)

            with torch.no_grad():
                outputs = clip_model(**inputs)
                probs = outputs.logits_per_image.softmax(dim=1)[0]

            # Pick top-2 descriptions
            top_indices = probs.topk(2).indices.tolist()
            caption = ", ".join(candidate_descriptions[j] for j in top_indices)
            captions.append({"caption": caption, "timestamp": timestamp})

            if (i + 1) % 10 == 0 or (i + 1) == total:
                print(f"    Described {i+1}/{total} frames")
        except Exception as e:
            print(f"    Warning: could not describe frame at {timestamp:.1f}s: {e}")

    print(f"  Generated {len(captions)} captions")
    return captions
