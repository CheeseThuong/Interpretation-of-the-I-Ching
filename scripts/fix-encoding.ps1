$utf8 = New-Object System.Text.UTF8Encoding $false
$files = @(
    'src\components\ui\AIReadingDisplay.tsx',
    'src\components\ui\ReadingSynthesis.tsx'
)
foreach ($f in $files) {
    $path = Join-Path $PSScriptRoot $f
    $content = [System.IO.File]::ReadAllText($path)
    [System.IO.File]::WriteAllText($path, $content, $utf8)
    Write-Host "Re-encoded: $f"
}
