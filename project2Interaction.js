/* Updates the object after changing projection type. */
function update(event) {
  if (event.keyCode == 38) {
    c1*=2;
    console.log("FOOBAR");
  } else if (event.keyCode == 40) {
    c1 *= -1;
  } else if(event.keyCode == 32) {
    randomizeColors();
  }
}
