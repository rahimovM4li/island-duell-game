"""Fetch hash-pinned model inputs. See docs/model-sources.md for attribution."""
import hashlib
from pathlib import Path
import shutil
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / 'art/source'
MPFB = 'https://raw.githubusercontent.com/makehumancommunity/mpfb2/master/src/mpfb/data/'
FILES = {
    'human-base.obj': (MPFB + '3dobjs/base.obj', '8e761e6624b8f54536409135d1636da63b32486a90d4897f84e121d144f6fb4c'),
    'human-rig.json': (MPFB + 'rigs/standard/rig.game_engine.json', 'b324ddb4b707721c19630bfadb87c3e3b38eed3b6e4590bb3cead43ea918f799'),
    'human-weights.json': (MPFB + 'rigs/standard/weights.game_engine.json', '9f4a773e74ce5ba08415b4f30070338e9f75bae5971b5075b10cd6b9caa58473'),
    'balisong.glb': ('https://www.get3dmodels.com/download/balisong_butterfly-knife_by_get3dmodels.glb', 'cc9178e8b7e347e18770406c9fe7daccccf8a300512caa24081a7f6ebc87c930'),
    'makehuman-system.zip': ('https://files2.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip', 'b542127a8e25547c7c29c19f2d1d2adb9a664c80396ecd694095dbc8028a0107'),
    'gloves.zip': ('https://files2.makehumancommunity.org/asset_packs/gloves01/gloves01_cc0.zip', 'ecdaee1d02749d17352791d415cb622a883350cc8a4b90eda3725aef35d9afb2'),
}
PREFIXES = (
    'skins/young_caucasian_male/', 'clothes/male_casualsuit05/',
    'clothes/shoes05/', 'clothes/toigo_gloves_short/',
    'eyes/low-poly/', 'eyes/materials/brown_eye.png', 'hair/short01/',
)

def main():
    DEST.mkdir(parents=True, exist_ok=True)
    for name, (url, expected) in FILES.items():
        target = DEST / name
        if not target.exists():
            print('Downloading', name)
            request = urllib.request.Request(url, headers={'User-Agent': 'Island-Duell-asset-builder/1.0'})
            with urllib.request.urlopen(request, timeout=120) as response, target.open('wb') as output:
                shutil.copyfileobj(response, output)
        actual = hashlib.sha256(target.read_bytes()).hexdigest()
        if actual != expected:
            raise RuntimeError(f'{name}: unexpected SHA256 {actual}; inspect the changed source before using it')
        if target.suffix == '.zip':
            with zipfile.ZipFile(target) as archive:
                for member in archive.infolist():
                    if member.is_dir() or not member.filename.startswith(PREFIXES):
                        continue
                    output = (DEST / 'makehuman' / member.filename).resolve()
                    if not output.is_relative_to((DEST / 'makehuman').resolve()):
                        raise RuntimeError('Archive path escapes model source directory')
                    output.parent.mkdir(parents=True, exist_ok=True)
                    with archive.open(member) as source, output.open('wb') as destination:
                        shutil.copyfileobj(source, destination)
        print('Verified', name)

if __name__ == '__main__':
    main()
