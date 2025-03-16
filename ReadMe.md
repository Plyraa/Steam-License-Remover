<h1 align = "center">
    <br>
    Steam License Remover
    <br>
    <br>
    <a href="https://ibb.co/D55WXk5"><img src="https://i.ibb.co/LnnRw6n/Sans-titre-modified.png" alt="Sans-titre-modified" border="0"></a>
    <br>
    <br>
    Forked Version: 1.0
    <br>
</h1>

# Fork Variant:

As far as I know, when you remove certain amount of licenses, Steam hit you with a cooldown and makes you wait 10 minutes. This script is aware of that and waits for it. While testing I realized that there are two codes for success `[1,8]` and for cooldown `[84]`. Also I tried to apply xPaw's recommendation to utilize `setTimeout` and `formData`. I am not an experienced coder in JavaScript so this script is vibe coded by Claude.

# Description:

This Script will remove any "Free" games from your Steam Library by removing the game's license from your account. In this way, these games will no longer appear in your library.

# Usage:

1. Copy the script to your clipboard.
2. Open your browser and go to https://store.steampowered.com/account/licenses/
3. Open the developer console (F12)
4. Paste the script into the console and press enter.
5. Wait for the script to finish.
6. Refresh the page. ( You may need to do this refresh with the cache, you can do this by pressing CTRL + F5 )

# Notes:

- This script will not remove any games that you have purchased.
- This script will not remove any games that you have been gifted.

# Disclaimer:

- This script is provided as is. I am not responsible for any damage that may occur to your account. Use at your own risk.

# Changelog:

 - 1.0 - initial fork

# Credits:

- SteamDB - https://steamdb.info/
- guiohm - pull request to main repo
- IroN404 - original
