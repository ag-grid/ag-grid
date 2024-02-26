module.exports = {
  mutateSource: ({ markdownNode }, {replacements}) => {
    const tokens = replacements ? Object.keys(replacements) : [];
    return new Promise((resolve, reject) => {
      try {
        tokens.forEach(token => {
          markdownNode.internal.content = markdownNode.internal.content.replace(new RegExp(token, "g"), replacements[token]);
        });
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },
};
