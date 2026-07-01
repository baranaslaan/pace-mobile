#!/usr/bin/env python3
"""Pace App Store / uygulama ikonunu üretir → assets/images/icon.png

Marka işareti: beyaz 'p' + mavi nokta, koyu zemin. 1024x1024, ALFASIZ
(Apple zorunlu kılar; köşeleri Apple maskeler — kareyi dolu bırak).
Gereksinim: Pillow (`pip3 install pillow`). Outfit fontu node_modules'tan.

    python3 scripts/make-icon.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLACK = os.path.join(ROOT, "node_modules/@expo-google-fonts/outfit/900Black/Outfit_900Black.ttf")
OUT = os.path.join(ROOT, "assets/images/icon.png")

S = 1024
BG = (7, 9, 14)        # #07090e — theme.bgPage
BLUE = (59, 130, 246)  # #3b82f6 — theme.stateGood
WHITE = (255, 255, 255)

img = Image.new("RGB", (S, S), BG)
d = ImageDraw.Draw(img)
size = 760
font = ImageFont.truetype(BLACK, size)
l, t, r, b = font.getbbox("p")
pw, ph = r - l, b - t
dot_d = int(size * 0.20)
gap = int(size * 0.05)
total_w = pw + gap + dot_d
x0 = (S - total_w) // 2
y0 = (S - ph) // 2 - t
d.text((x0 - l, y0), "p", font=font, fill=WHITE)
cx = x0 + pw + gap
cy = (y0 + ph) - dot_d // 2  # nokta baseline'a otur
d.ellipse([cx, cy, cx + dot_d, cy + dot_d], fill=BLUE)
img.save(OUT)
print("yazıldı:", OUT)
