import cv2
import numpy as np

img = cv2.imread('/Users/akio/.gemini/antigravity/brain/97c7dd24-7ad9-49bf-be9f-fa667e371a58/media__1779368446777.png')
h, w, c = img.shape
print(f"Image shape: {w}x{h}")

# Let's sample colors at different Y coordinates (along the center column)
x = w // 2
step = h // 20
for y in range(0, h, step):
    b, g, r = img[y, x]
    print(f"y={y}: R={r}, G={g}, B={b} (Hex: #{r:02x}{g:02x}{b:02x})")
