import React, { useState, useRef, useEffect } from "react";
import "./PlacePickerModal.css";
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM } from "ol/source";
import { fromLonLat, toLonLat } from "ol/proj";
import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorSource from "ol/source/Vector";
import { Icon, Style } from "ol/style";

// red marker SVG
const RED_MARKER_URL =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png";

export default function PlacePickerModal({ onPick, onClose }) {
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [picked, setPicked] = useState(null); // { name, lat, lon }
  const mapRef = useRef();
  const markerSource = useRef(new VectorSource());
  const mapInstance = useRef(null);

  // Fetching places from OpenStreetMap Nominatim
  async function handleSearch() {
    if (!input.trim()) return;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        input.trim()
      )}`
    );
    const data = await res.json();
    setSearchResults(data);
  }

  // Initialize map 
  useEffect(() => {
    if (mapInstance.current) return;

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({
          source: markerSource.current,
          style: new Style({
            image: new Icon({
              src: RED_MARKER_URL, 
              anchor: [0.5, 1],
              scale: 1,
            }),
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([72.8321, 18.9582]), // Default to Mumbai
        zoom: 10,
      }),
    });

    // Allow manual pin drop on click
    mapInstance.current.on("click", function (evt) {
      const coord = toLonLat(evt.coordinate);
      setPicked({
        name: "Pinned location",
        lon: coord[0],
        lat: coord[1],
      });
    });

    // Cleanup on modal unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(null);
        mapInstance.current = null;
      }
    };
  }, []);

  // Update pin and center map when a result is picked or pin dropped
  useEffect(() => {
    if (picked && picked.lon && picked.lat && mapInstance.current) {
      markerSource.current.clear();
      markerSource.current.addFeature(
        new Feature({
          geometry: new Point(fromLonLat([picked.lon, picked.lat])),
        })
      );
      // Center and zoom in
      mapInstance.current.getView().animate({
        center: fromLonLat([picked.lon, picked.lat]),
        zoom: 13,
        duration: 400,
      });
    }
  }, [picked]);

  function handlePick() {
    if (picked && picked.lat && picked.lon) {
      onPick({
        name: picked.display_name || picked.name,
        lat: picked.lat,
        lng: picked.lon,
        address: picked.display_name || picked.name,
      });
    }
  }

  return (
    <div className="move-modal-bg">
      <div className="move-modal" style={{ maxWidth: 500 }}>
        <h4>Pick or Pin a Place</h4>
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search for a place"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <button className="modal-btn" style={{ marginBottom: 10 }} onClick={handleSearch}>
              Search
            </button>
            <ul className="place-results-list">
              {searchResults.map(pl => (
                <li
                  key={pl.place_id}
                  className={
                    "place-result-item" +
                    (picked && picked.place_id === pl.place_id ? " selected" : "")
                  }
                  onClick={() => setPicked(pl)}
                >
                  <b>{pl.display_name.split(",")[0]}</b>
                  <div style={{ fontSize: "0.92em", color: "#888" }}>
                    {pl.display_name}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div
              ref={mapRef}
              style={{
                width: "100%",
                height: 220,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            ></div>
            <div style={{ fontSize: "0.96em", marginTop: 6, color: "#666" }}>
              Tap on map to pin a place, or pick from search above.
            </div>
            {picked && (
              <div style={{ marginTop: 8, fontSize: "0.98em" }}>
                <b>Selected:</b> <span>{picked.display_name || picked.name}</span>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            className="modal-btn"
            onClick={handlePick}
            disabled={!picked || !picked.lat || !picked.lon}
          >
            Save
          </button>
          <button className="modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}