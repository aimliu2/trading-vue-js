# create custom template using tutorial hack
1. copy default template from `docdash`, `better-docs`, or default
```bash
cp -r node_modules/docdash ./jsdoc-template
```
2. in `publish.js` search for wording **'Tutorials'** in section
```js
...
// in publish.js
var sections = {
Tutorials: buildMemberNav(members.tutorials, 'Tutorials', seenTutorials, linktoTutorial)
}
```
3. rename the wording to something else i.e. **Vue**
```js
...
// in publish.js
var sections = {
Tutorials: buildMemberNav(members.tutorials, 'Vue', seenTutorials, linktoTutorial) // rename
}
```
4. change template in `jsdoc.json` from current template to the edited template
```json
from
"template": "node_modules/docdash",
```
```json
to
"template": "./jsdoc-template",
```
5. bonus : change wording by edit `saveChildren` function in `publish.js`
```js
...
function saveChildren(node) {
        node.children.forEach(function(child) {
            generateTutorial(' ' + child.title, child, helper.tutorialToUrl(child.name)); // edit word
            saveChildren(child);
        });
    }
```