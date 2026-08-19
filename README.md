# Roofline Light Designer — Relay Server

This tiny server sits between the browser tool and OpenAI. It exists because
OpenAI's API refuses direct calls from browser JavaScript (no CORS headers) —
every request has to come from a server. This one also keeps your OpenAI key
out of the browser entirely, which is safer regardless.

## Deploy to Render (same place as your spam filter webhook)

1. Push this folder to a GitHub repo (or a new folder in an existing one).
2. In Render: **New → Web Service**, connect the repo.
   - **Build command:** `npm install`
   - **Start command:** `npm start`
3. Go to the service's **Environment** tab and add:
   - `OPENAI_API_KEY` = your OpenAI secret key (starts with `sk-`)
4. Deploy. Render will give you a URL like:
   `https://roofline-light-relay.onrender.com`
5. In the Roofline Light Designer tool, paste that URL (as-is, no trailing
   slash needed) into the **Relay endpoint** field.

## Test it's alive

Visit the Render URL directly in a browser — you should see:
`Roofline Light Designer relay is running.`

## Notes

- Free Render web services spin down after inactivity and take ~30-60s to
  wake up on the first request after idling — the first render after a break
  may just look slow, not broken.
- Nothing here stores your photos; each request is processed and forwarded,
  nothing is written to disk.
- If you ever want to lock this down further, you can restrict `cors()` to
  only allow requests from wherever you end up hosting the tool itself,
  instead of allowing all origins.
