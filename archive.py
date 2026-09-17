from pathlib import Path
import zipfile

root = Path(__file__).resolve().parent
destination = root.parent / 'Jesper-demo.zip'
files = sorted(f for f in root.rglob('*') if f.is_file()
               and not any(part in ('node_modules', '.git', '.vite', '__pycache__') for part in f.relative_to(root).parts)
               and f.suffix != '.zip')
with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED, strict_timestamps=False) as archive:
    for file in files:
        archive.write(file, Path('Jesper-demo') / file.relative_to(root))
with zipfile.ZipFile(destination) as archive:
    assert archive.testzip() is None
    assert 'Jesper-demo/app/src/App.jsx' in archive.namelist()
    assert 'Jesper-demo/app/dist/client/index.html' in archive.namelist()
    print(len(archive.namelist()), 'files')
print(destination, destination.stat().st_size, 'bytes')
incomplete = root / 'Jesper-demo.zip'
if incomplete.is_file():
    incomplete.unlink()  # Incomplete archive created by the first attempt in this task.
