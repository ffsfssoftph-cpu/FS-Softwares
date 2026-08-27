[Setup]
AppName=FS Softwares Backend
AppVersion=1.0.0
DefaultDirName={pf}\FS Softwares\backend
DisableDirPage=yes

[Files]
Source: "{#BackendExe}"; DestDir: "{app}"; Flags: ignoreversion

[Run]
Filename: "{app}\backend.exe"; Description: "Start FS Backend"; Flags: nowait postinstall skipifsilent

; Note: This Inno Setup script assumes a bundled backend executable named backend.exe.
; Packaging Node backend into a native exe and creating a Windows Service via NSSM should be implemented in CI packaging steps.
