@echo off
set zipfile=%1RvtGalleryUploader.bundle.zip
set credfile=%1credentials.txt
set dlldir=%1bin/Debug
echo makebundle.bat: creating RvtGalleryUploader.bundle.zip...
zip -j %zipfile% %credfile% %dlldir%/*.dll
