from PIL import Image, ImageDraw
from io import BytesIO
from django.core.files.base import ContentFile
from .models import User

def create_signature_image(signature_data):
    width = signature_data["width"]
    height = signature_data["height"]
    strokes = signature_data["strokes"]

    image = Image.new("RGBA", (width, height), (0,0,0,0))
    draw = ImageDraw.Draw(image)

    for stroke in strokes:
        if len(stroke) < 2:
            continue

        for i in range(1, len(stroke)):
            previous = stroke[i - 1]
            current = stroke[i]

            draw.line(
                [
                    (previous["x"], previous["y"]),
                    (current["x"], current["y"])
                ],
                fill="#002735",
                width=2
            )

    return image

def save_signature(user, strokes):
    image = create_signature_image(strokes)

    buffer = BytesIO()
    image.save(buffer, format="PNG")

    filename = f"{user.id}.png"

    user.e_signature.save(
        filename,
        ContentFile(buffer.getvalue()),
        save=True
    )