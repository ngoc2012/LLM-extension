# LLM-extension

## Install


1. **Download or clone the project**

   * If you downloaded a `.zip` file, extract it to a folder on your computer.
   * Make sure you know the path to this folder (e.g., `~/Downloads/my-extension`).
   * Build `dist` folders with command `make`

2. **Open the Extensions page in Chrome**

   * Go to: [`chrome://extensions`](chrome://extensions)
   * Or open Chrome’s menu → **More Tools → Extensions**.

3. **Enable Developer Mode**

   * In the top-right corner of the Extensions page, toggle **Developer mode** ON.
   * This allows you to load unpacked (local) extensions.

4. **Load the extension**

   * Click **Load unpacked**.
   * In the file dialog, select the folder where your extension’s `manifest.json` file is located.

5. **Verify installation**

   * The extension should now appear in your list of installed extensions.
   * You can pin it to your toolbar by clicking the puzzle icon 🧩 → pin the extension.

---

### 🔁 Updating the Extension

If you make changes to the code:

* Go back to the `chrome://extensions` page.
* Click the **Reload** button (🔄) on your extension’s card to apply updates instantly.