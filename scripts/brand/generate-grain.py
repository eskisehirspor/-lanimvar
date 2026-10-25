"""Film-grain tile for flood surfaces → src/brand/generated/grain.ts (inlined data URI)."""
import base64, io, pathlib, random
from PIL import Image

random.seed(7)
N = 160
im = Image.new('LA', (N, N))
px = im.load()
for y in range(N):
    for x in range(N):
        px[x, y] = (255 if random.randint(0, 255) > 127 else 0, int(random.randint(0, 255) * 0.55))
buf = io.BytesIO()
im.save(buf, 'PNG', optimize=True)
out = pathlib.Path(__file__).resolve().parents[2] / 'src/brand/generated/grain.ts'
out.write_text(
    '/** Generated film-grain tile (scripts/brand/generate-grain.py). Inlined so previews stay single-file. */\n'
    f"export const grainTile = 'data:image/png;base64,{base64.b64encode(buf.getvalue()).decode()}';\n"
)
print(out)
