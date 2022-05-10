build.zip: manifest.json popup.html check.js icons/*
	zip $@ $^
