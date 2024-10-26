# Obtener todos los archivos .webp en el directorio actual
$files = Get-ChildItem -Path . -Filter *.webp

# Crear una lista para almacenar los objetos de personajes
$charactersList = @()

# Asignar un ID inicial
$id = 1

# Recorrer cada archivo y construir el objeto de personaje
foreach ($file in $files) {
    # Obtener el nombre del archivo sin la extensión
    $name = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)

    # Crear el objeto de personaje con los campos requeridos
    $character = @{
        "id" = $id
        "name" = $name
        "dp" = $null  # Puedes asignar un valor por defecto o dejarlo como $null
        "image" = "images/$($file.Name)"
        "canDuplicate" = $false
        "details" = @{
            "attacks" = @()
            "actions" = @()
            "health" = $null
            "strength" = $null
            "defense" = $null
            "speed" = $null
            "ki" = $null
        }
    }

    # Agregar el objeto a la lista
    $charactersList += $character

    # Incrementar el ID
    $id++
}

# Convertir la lista de personajes a JSON con formato
$json = $charactersList | ConvertTo-Json -Depth 5

# Guardar el JSON en un archivo llamado characters.json
Set-Content -Path .\characters.json -Value $json

Write-Host "Archivo characters.json generado exitosamente."
