"""Build a single self-contained HTML preview of the Design Lab (for hosts that only allow inline assets).

    npm run preview:web   →   dist-preview/ilanim-var.html
"""
import base64, os, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
S = ROOT / 'dist-preview'
OUT = os.environ.get('PREVIEW_OUT', 'ilanim-var.html')
# FRAME=0: full-width page (admin panel); default frames the app as a phone on wide screens.
FRAME = os.environ.get('FRAME', '1') != '0'
bundle = next((S / 'web/_expo/static/js/web').glob('entry-*.js')).read_text()
bundle = bundle.replace('</script', '<\\/script').replace('<!--', '<\\!--')
fonts = {
  'BarlowCondensed_700Bold': 'barlow-condensed/700Bold/BarlowCondensed_700Bold.ttf',
  'BarlowCondensed_800ExtraBold': 'barlow-condensed/800ExtraBold/BarlowCondensed_800ExtraBold.ttf',
  'BricolageGrotesque_700Bold': 'bricolage-grotesque/700Bold/BricolageGrotesque_700Bold.ttf',
  'BricolageGrotesque_800ExtraBold': 'bricolage-grotesque/800ExtraBold/BricolageGrotesque_800ExtraBold.ttf',
  'InstrumentSans_400Regular': 'instrument-sans/400Regular/InstrumentSans_400Regular.ttf',
  'InstrumentSans_500Medium': 'instrument-sans/500Medium/InstrumentSans_500Medium.ttf',
  'InstrumentSans_600SemiBold': 'instrument-sans/600SemiBold/InstrumentSans_600SemiBold.ttf',
  'InstrumentSans_700Bold': 'instrument-sans/700Bold/InstrumentSans_700Bold.ttf',
  'InstrumentSerif_400Regular_Italic': 'instrument-serif/400Regular_Italic/InstrumentSerif_400Regular_Italic.ttf',
}
faces = '\n'.join(
  f"@font-face{{font-family:'{name}';src:url(data:font/ttf;base64,{base64.b64encode((ROOT/'node_modules/@expo-google-fonts'/rel).read_bytes()).decode()}) format('truetype');font-display:block}}"
  for name, rel in fonts.items())
html = f"""<title>İlanım Var</title>
<style>
/* Phone-first app preview. On a phone it runs full screen; on a wide screen the body itself
   becomes a 390pt device so the app's own layout, sheets and modals stay inside it. */
:root {{ --desk: #E6E4DE; --app: #FFFFFF; --frame: #0A1124; color-scheme: light; }}
{faces}
html, body {{ height: 100%; }}
html {{ background: var(--desk); }}
body {{ background: var(--app); overflow: hidden; margin: 0; }}
#root {{ display: flex; height: 100%; flex: 1; }}
@media (min-width: {600 if FRAME else 100000}px) {{
  body {{ width: 390px; height: min(844px, calc(100% - 48px)); margin: 24px auto; border-radius: 46px;
         transform: translateZ(0); box-shadow: 0 0 0 10px var(--frame), 0 40px 80px rgba(10,17,36,.28); }}
}}
</style>
<script>
(function () {{
  // On wide screens, report the device size to the app so it lays out exactly as on a phone.
  if (window.innerWidth < 600 || !__FRAME__) return;
  var w = 390, h = Math.min(844, window.innerHeight - 48);
  try {{
    Object.defineProperty(window, 'visualViewport', {{ configurable: true, value: {{ width: w, height: h, scale: 1, addEventListener: function () {{}}, removeEventListener: function () {{}} }} }});
  }} catch (e) {{}}
}})();
</script>
<div id="root"></div>
<script>{bundle}</script>
"""
html = html.replace('__FRAME__', 'true' if FRAME else 'false')
out = S / OUT
out.write_text(html)
print(out, round(out.stat().st_size / 1e6, 2), 'MB')
