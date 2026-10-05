# WEBHEAD LAB · GitHub Pages bundle

## Publish the mobile-friendly page

Upload this folder's contents to a GitHub repository, enable GitHub Pages for the chosen branch and folder, and open the Pages URL on a phone. `index.html` is a standalone responsive page; it has no build step and does not require a backend for lessons, progress, or the dictionary.

## Doubao photo grading

GitHub Pages serves static files only. The optional `functions/api/grade.js` endpoint is for Cloudflare Pages and will not run on GitHub Pages. Follow `DEPLOY_DOUBAO.md` to configure that feature on Cloudflare; never put API keys in `index.html` or a public repository.

## Study notes and references

The page contains original explanations, proof walkthroughs, and worked examples arranged around the listed editions: Tongji Higher Mathematics, 8th edition; Sears and Zemansky, University Physics, 13th edition (mechanics); and Sheldon Axler, Linear Algebra Done Right, 4th edition. Consult the books for notation and edition-specific details. The official contents sources are:

- Tongji Higher Mathematics, 8th edition, upper volume: <https://xuanshu.hep.com.cn/front/book/findBookDetails?bookId=62cdab46938b7cc2960eedb1>
- Tongji Higher Mathematics, 8th edition, lower volume: <https://xuanshu.hep.com.cn/front/book/findBookDetails?bookId=62bc8b97938b7cc2960eebb7>
- Axler, 4th edition and license information: <https://linear.axler.net/> and <https://creativecommons.org/licenses/by-nc/4.0/>
- Sears 13th-edition catalog record: <https://biblioteca.uaysen.cl/bib/64>
- MIT 8.01SC Classical Mechanics: <https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/pages/>

Axler's book is CC BY-NC 4.0. The page links to the book and uses original teaching notes rather than reproducing the book's text. This page is a personal study aid, not a substitute for the cited books.

## Coverage status

The current page has 83 section cards for Tongji, 35 section cards for Axler, and 33 Sears mechanics modules. Public official contents pages verify the chapter and section sequence, but do not show every boldface theorem/corollary in the printed books. Therefore this is not yet a verified one-to-one inventory of every bold theorem and corollary. The explanations cover major results in original wording; edition-by-edition completeness requires checking the actual theorem pages against the physical/digital copies.
