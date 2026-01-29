$fonts = @(
    "https://github.com/google/fonts/raw/main/ofl/roboto/Roboto-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/opensans/OpenSans-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/lato/Lato-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/montserrat/Montserrat-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/oswald/Oswald-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/raleway/Raleway-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/notosans/NotoSans-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/merriweather/Merriweather-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/playfairdisplay/PlayfairDisplay-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/ubuntu/Ubuntu-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/ptsans/PTSans-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/droidsans/DroidSans.ttf",
    "https://github.com/google/fonts/raw/main/ofl/lora/Lora-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/rubik/Rubik-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/mukta/Mukta-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/nunito/Nunito-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/worksun/WorkSans-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/quicksand/Quicksand-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/karla/Karla-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/hind/Hind-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/cabin/Cabin-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/bitter/Bitter-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/josefinsans/JosefinSans-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/fjallaone/FjallaOne-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/arvo/Arvo-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/muli/Muli-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/catamaran/Catamaran-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/asap/Asap-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/teko/Teko-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/indieflower/IndieFlower-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/lobster/Lobster-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/pacifico/Pacifico-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/dancing_script/DancingScript-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/shadows_into_light/ShadowsIntoLight-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/abril_fatface/AbrilFatface-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/bree_serif/BreeSerif-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/concert_one/ConcertOne-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/satisfy/Satisfy-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/great_vibes/GreatVibes-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/permanent_marker/PermanentMarker-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/righteous/Righteous-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/fredoka_one/FredokaOne-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/courgette/Courgette-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/pathway_gothic_one/PathwayGothicOne-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/audiowide/Audiowide-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/luckiest_guy/LuckiestGuy-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/bangers/Bangers-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/chewy/Chewy-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/sigmar_one/SigmarOne-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/caveat/Caveat-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/yellowtail/Yellowtail-Regular.ttf",
    "https://github.com/google/fonts/raw/main/ofl/kaushan_script/KaushanScript-Regular.ttf"
)

$destDir = "d:\Mobile-apps\adminpannel-1-20-2026\VideoPosterMaker\birthday-poster-backend\assets\fonts"

foreach ($url in $fonts) {
    try {
        $filename = [System.IO.Path]::GetFileName($url)
        $output = Join-Path $destDir $filename
        Write-Host "Downloading $filename..."
        Invoke-WebRequest -Uri $url -OutFile $output
    } catch {
        Write-Host "Failed to download $url"
    }
}
Write-Host "Download complete."
