import React, { useEffect, useRef, useState } from "react";
import { usePlan } from "../context/PlanContext";
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM } from "ol/source";
import { fromLonLat } from "ol/proj";
import { Feature } from "ol";
import { Point, LineString } from "ol/geom";
import VectorSource from "ol/source/Vector";
import { Style, Stroke, Circle as CircleStyle, Fill, Text } from "ol/style";
import Overlay from "ol/Overlay";

// Order of slots for timeline
const SLOT_ORDER = ["morning", "afternoon", "evening", "night"];
// Your OpenRouteService API Key
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijc5OGM4NzEwZDhlMjRhY2U4ZTc2MTA4MGRkZGM4Y2E2IiwiaCI6Im11cm11cjY0In0="; // Replace with your API key

export default function DistanceTracker() {
  const { plan, selectedDays } = usePlan();
  const [routeInfo, setRouteInfo] = useState(null); // { distance, duration, geometry }
  const mapRef = useRef();
  const mapInstance = useRef();
  const markerSource = useRef(new VectorSource());
  const routeSource = useRef(new VectorSource());
  const routeLayer = useRef();
  const markerLayer = useRef();

  // 1. Collect all places in timeline order
  const locations = [];
  selectedDays.forEach(day => {
    SLOT_ORDER.forEach(slot => {
      (plan[day]?.[slot] || []).forEach(act => {
        if (act.place && act.place.lat && act.place.lng) {
          locations.push({
            label: act.name,
            lat: Number(act.place.lat),
            lng: Number(act.place.lng),
            icon: act.icon,
            mood: act.mood
          });
        }
      });
    });
  });

  // 2. Fetch route info from OpenRouteService if >1 point
  useEffect(() => {
    if (locations.length < 2) {
      setRouteInfo(null);
      return;
    }
    async function fetchRoute() {
      const coords = locations.map(p => [p.lng, p.lat]);
      const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": ORS_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            coordinates: coords
          })
        });
        if (!res.ok) {
          setRouteInfo(null);
          return;
        }
        const geojson = await res.json();
        const summary = geojson.features[0]?.properties?.summary;
        setRouteInfo({
          distance: summary?.distance, // meters
          duration: summary?.duration, // seconds
          geometry: geojson.features[0]?.geometry?.coordinates
        });
      } catch {
        setRouteInfo(null);
      }
    }
    fetchRoute();
    // eslint-disable-next-line
  }, [locations.length, JSON.stringify(locations)]);

  // 3. Initialize map and update markers/route
  useEffect(() => {
    // Map and layers (only once)
    if (!mapInstance.current && mapRef.current) {
      // Route path layer (bold and blue)
      routeLayer.current = new VectorLayer({
        source: routeSource.current,
        style: new Style({
          stroke: new Stroke({
            color: "#2563eb", // blue is more user-friendly and map-like
            width: 6,
            lineCap: "round"
          })
        })
      });

      // Marker layer (numbered circles)
      markerLayer.current = new VectorLayer({
        source: markerSource.current,
        style: feature =>
          new Style({
            image: new CircleStyle({
              radius: 16,
              fill: new Fill({ color: "#fff" }),
              stroke: new Stroke({ color: "#2563eb", width: 4 })
            }),
            text: new Text({
              text: String(feature.get("num") || ""),
              font: "bold 1.15em sans-serif",
              fill: new Fill({ color: "#2563eb" }),
              stroke: new Stroke({ color: "#fff", width: 3 }),
              offsetY: 1
            })
          })
      });

      mapInstance.current = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({ source: new OSM() }),
          routeLayer.current,
          markerLayer.current
        ],
        view: new View({
          center: fromLonLat([77.5946, 12.9716]),
          zoom: 8
        })
      });
    }

    // Remove all overlays (labels)
    if (mapInstance.current) {
      mapInstance.current.getOverlays().clear();
    }
    // Clear markers and route
    markerSource.current.clear();
    routeSource.current.clear();

    // Add markers and overlays for all locations
    locations.forEach((loc, idx) => {
      // Marker as a styled circle with number
      const markerFeature = new Feature({
        geometry: new Point(fromLonLat([loc.lng, loc.lat])),
        name: loc.label,
        num: idx + 1 // for circle number
      });
      markerSource.current.addFeature(markerFeature);

      // Overlay label (activity name & emoji)
      if (mapInstance.current) {
        const el = document.createElement("div");
        el.className = "marker-label";
        el.innerHTML = `<span style="font-size:1.15em">${loc.icon || ""}</span> ${loc.label}`;
        const overlay = new Overlay({
          element: el,
          position: fromLonLat([loc.lng, loc.lat]),
           positioning: "bottom-center", // <-- This puts the label above the marker
  offset: [0, -28]    
        });
        mapInstance.current.addOverlay(overlay);
      }
    });

    // Draw route with blue style
    if (routeInfo && routeInfo.geometry) {
      routeSource.current.addFeature(
        new Feature({
          geometry: new LineString(
            routeInfo.geometry.map(([lng, lat]) => fromLonLat([lng, lat]))
          )
        })
      );
    }

    // Fit view to all markers/route
    if (locations.length > 0 && mapInstance.current) {
      const extent = markerSource.current.getExtent();
      mapInstance.current.getView().fit(extent, { padding: [40, 40, 40, 40], maxZoom: 15 });
    }
  }, [locations, routeInfo]);

  // 4. Neat summary text
  function formatDistance(m) {
    if (!m) return "-";
    if (m > 1000) return (m / 1000).toFixed(2) + " km";
    return Math.round(m) + " m";
  }
  function formatDuration(s) {
    if (!s) return "-";
    const min = Math.round(s / 60);
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)} hr ${min % 60} min`;
  }

  return (
    <div className="distance-tracker-root">
      <h3>Route & Distance Overview</h3>
      <div ref={mapRef} style={{
        height: 320,
        width: "100%",
        borderRadius: 16,
        border: "1.5px solid #e0e7ff",
        marginBottom: 18,
        background: "#f9fafb"
      }} />
      <div className="distance-summary">
        {locations.length < 2 ? (
          <span>Add at least 2 places to see the route!</span>
        ) : routeInfo ? (
          <>
            <span>🚗 <b>Total Distance:</b> {formatDistance(routeInfo.distance)}</span>
            <span style={{marginLeft: 18}}>⏱ <b>Est. Time:</b> {formatDuration(routeInfo.duration)}</span>
          </>
        ) : (
          <span>Loading route...</span>
        )}
      </div>
      <ul className="distance-task-list">
        {locations.map((loc, idx) => (
          <li key={idx}>
            <span className="task-number">{idx + 1}.</span>
            <span className="task-icon">{loc.icon}</span>
            <span className="task-label">{loc.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}