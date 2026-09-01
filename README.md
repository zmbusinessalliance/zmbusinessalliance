# ZM Business Alliance — Premium Website + Admin Panel

## Included
- Premium black/gold homepage based on the supplied reference design.
- Supplied ZM logo and posters are included in `assets/`.
- Responsive mobile + desktop layout.
- Sections: Home, About, Services, Partnerships, Insights, Apply, Contact.
- Admin panel at `/admin.html`.
- Serverless admin API at `/.netlify/functions/admin-api`.
- Persistent site content stored using Netlify Blobs.
- No admin password is hard-coded.

## Netlify deployment
1. Upload/deploy this folder/ZIP to Netlify.
2. In Netlify: Project configuration → Environment variables.
3. Add:
   - `ADMIN_PASSWORD` = your private admin password
   - `ADMIN_SESSION_SECRET` = a long random secret (at least 32 characters)
4. Redeploy the site.
5. Open `/admin.html` and login.

## Important
The initial posters supplied in the conversation are already packaged in `assets/`.
The admin panel manages persistent text/content lists. The public homepage currently uses the supplied poster files directly so the visual design remains stable.

For security, do not share `ADMIN_PASSWORD` or `ADMIN_SESSION_SECRET`.

## Brand contact details used from the supplied posters
Phone/WhatsApp: +91 8398802971
Email: zmbusinessalliance@gmail.com
Instagram: @zmbusinessalliance
