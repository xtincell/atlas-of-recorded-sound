# An Atlas of Recorded Sound

A standalone editorial atlas of 285 genres, 699 relationships and 17 families.
Explore musical ancestry, fusions and influences, then inspect a genre's traits
and artists. The highlighted rap × bossa nova case is described by the existing
corpus as emerging and not yet canonised; it is not a music-generation service.

The descriptions and relationships are inherited editorial material. Individual
citations have not been supplied. Each detail links to the original corpus;
this release preserves that corpus exactly and does not certify its historical claims.

## Explore and resume

- Search by genre, alias or artist; Enter opens the first matching result.
- Use Tab to enter the graph, arrows to move, and Enter or Space for detail.
  Escape closes the detail and returns focus to the genre.
- Filter families and lineage types. The Families control exposes the same
  filters on narrow screens.
- The address contains the selected genre, filters, camera and corpus revision.
  Bookmark or copy it to resume in another tab. Back returns to the preceding
  selection. No account, storage service or model call is required.

## Check and serve

Run `node --test` with Node 22 or newer. These checks exercise the actual search
handlers and corpus integrity; they do not replace native browser verification.

The Dockerfile packages the static `index.html` in Nginx. Build with
`docker build -t recorded-sound-atlas .`, then serve locally with
`docker run --rm -p 127.0.0.1:8080:80 recorded-sound-atlas`.

In Shinkiro, Atlas remains an independent cultural research product. A retained
reference can inform a creative exploration; its inclusion is a human decision,
and a proposed campaign does not become approved through browsing the atlas.

Focus retains the original bounded-neighbourhood method: a relationship costs one,
an influence costs two, and the focus budget is three. Ancestor and descendant
buttons let you continue through the graph.
