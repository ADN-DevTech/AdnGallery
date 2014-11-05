@echo off
set zipfile=%1RvtGalleryUploader.bundle.zip
set dlldir=%1bin/Debug
echo makebundle.bat: creating RvtGalleryUploader.bundle.zip...
zip %zipfile% %dlldir%/*.dll
