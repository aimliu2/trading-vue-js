exports.defineTags = function(dictionary) {
  dictionary.defineTag('component', {
    mustHaveValue: true,
    canHaveType: false,
    canHaveName: true,
    onTagged: function(doclet, tag) {
      doclet.component = tag.value; // Attach tag value to the doclet
    }
  });
};
