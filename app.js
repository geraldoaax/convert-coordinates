const express = require("express");
const proj4 = require("proj4");
const XLSX = require("xlsx");
const cors = require("cors");

const app = express();
const port = 3000;

var proj22523 =
  "+proj=utm +zone=23 +south +ellps=aust_SA +towgs84=-66.87,4.37,-38.52,0,0,0,0 +units=m +no_defs";
var proj4326 = "+proj=longlat +datum=WGS84 +no_defs";

app.use(cors()); // Enable CORS

app.get("/convert", (req, res) => {
  // Load the Excel file
  const workbook = XLSX.readFile("files/geomreferencias_cmt.xlsx");
  const sheet_name_list = workbook.SheetNames;
  const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  // Convert the coordinates and include the signal value
  const convertedCoordinates = xlData
    .map((row) => {
      const x = row["Latitude"];
      const y = row["Longitude"];
      const signal = parseFloat(row["Signal"]);

      const coordinates = proj4(proj22523, proj4326, [x, y]);

      if (isNaN(coordinates[0]) || isNaN(coordinates[1])) {
        console.error("Invalid conversion:", x, y, coordinates);
        return null; // Skip this row
      }

      return { coordinates, signal };
    })
    .filter((coord) => coord !== null); // Remove any null values

  res.json(convertedCoordinates);
});

app.listen(port, () => {
  console.log(`Application running at http://localhost:${port}`);
});
