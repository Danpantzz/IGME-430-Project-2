const appPage = async (req, res) => res.render('app');

// this is where I anticipated the code for handling the 
// actual "draw something" game loop would have been,
// however I could not figure out how to prevent users 
// other than the current player drawing to have no access to the canvas.
// I also could not find any API or other sort of repository of words for 
// players to draw out, and without much time, could not
// come up with enough words on my own.

module.exports = {
  appPage,
};
