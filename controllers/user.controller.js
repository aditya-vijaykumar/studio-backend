exports.clientBoard = (req, res) => {
  res.status(200).send("Client Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};