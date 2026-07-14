# Deployment Instructions

## Option 1: Publish to GitHub Pages

1. Create a GitHub repository for this project.
2. Add the remote and push the code:

```powershell
cd /d c:\Shivan_Gupta\VS_Code\Phanee_Task
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

3. In GitHub, go to `Settings → Pages` and select the `main` branch and `/ (root)` folder.
4. Save and wait a few minutes for the site to become available.

The app will be served as a static site from `index.html`.

## Option 2: Deploy with a static host

Use any static web host such as Netlify, Vercel, or Surge:

- Netlify: drag-and-drop the project folder or connect the GitHub repo.
- Vercel: import the project and set the build command to none for a static folder.
- Surge: install Surge and run `surge .` from the project folder.

## Option 3: Local preview

Run a simple local server:

```powershell
cd /d c:\Shivan_Gupta\VS_Code\Phanee_Task
python -m http.server 4173
```

Then open `http://localhost:4173`.
