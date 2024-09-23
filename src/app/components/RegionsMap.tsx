import React, { useRef, useEffect, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  ThemeProvider,
  createTheme
} from '@mui/material';

import { Feature, FeatureProperties } from '../types';

const theme = createTheme();

const Sidebar: React.FC<{
  features: Feature[],
  selectedFeature: Feature | null,
  onFeatureSelect: (feature: Feature) => void
}> = ({ features, selectedFeature, onFeatureSelect }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        width: '25%',
        height: '100vh',
        overflowY: 'auto',
        padding: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
      }}
    >
      <Typography variant="h4" gutterBottom>
        Regions
      </Typography>
      <List>
        {features.map((feature, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              onClick={() => onFeatureSelect(feature)}
              selected={selectedFeature?.id === feature.id}
            >
              <ListItemText
                primary={feature.properties.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="textPrimary">
                      {`${feature.properties.start_year} - ${feature.properties.end_year}`}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="textSecondary">
                      {feature.properties.event_jp}
                    </Typography>
                  </>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default function RegionsMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const center = { lng: 113, lat: 31 };
  const zoom = 4;
  maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';

  useEffect(() => {
    if (map.current) return;

    map.current = new maptilersdk.Map({
      container: mapContainer.current!,
      style: 'https://api.maptiler.com/maps/bc259077-667f-4a6d-b522-13461b52c3f0/style.json?key=XQT6n226c8uDhF910NU4',
      center: [center.lng, center.lat],
      zoom: zoom
    });

    map.current.on('load', async function () {
      try {
        const image = await map.current!.loadImage('/images/marker-icon.png');
        map.current!.addImage('pin', image.data);

        const imageSelected = await map.current!.loadImage('/images/marker-icon-2x.png');
        map.current!.addImage('pinSelected', imageSelected.data);

        const geojson = await maptilersdk.data.get('aef3160d-7449-456a-8521-6a689a6fb402');

        // Add source
        map.current!.addSource('Provinces Points', {
          type: 'geojson',
          data: geojson
        });

        const typedFeatures: Feature[] = geojson.features.map((feature: any, index: number) => ({
          ...feature,
          id: index,
          type: 'Feature',
          properties: feature.properties as FeatureProperties,
          geometry: {
            type: 'Point',
            coordinates: feature.geometry.coordinates as [number, number]
          }
        }));

        // Add layer
        map.current!.addLayer({
          id: 'Provinces Points',
          type: 'symbol',
          source: 'Provinces Points',
          'layout': {
            'icon-image': 'pin',
            'icon-allow-overlap': true,
          },
          'paint': {}
          // paint: {
          //   'circle-radius': 10,
          //   'circle-color': [
          //     'case',
          //     ['boolean', ['feature-state', 'selected'], false],
          //     '#007cbf',
          //     '#B42222'
          //   ],
          //   'circle-stroke-width': 2,
          //   'circle-stroke-color': '#ffffff'
          //}
        });

        map.current!.addLayer({
          id: 'Provinces Labels',
          type: 'symbol',
          source: 'Provinces Points',
          layout: {
            'text-field': ['get', 'name'],
            'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
            'text-radial-offset': 0.5,
            'text-justify': 'auto',
            'icon-image': ['get', 'icon']
          },
          paint: {
            'text-color': '#000000',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1
          }
        });
        
        // Set features for the sidebar
        setFeatures(typedFeatures);

        // Add click event to the map
        map.current!.on('click', 'Provinces Points', (e) => {
          if (e.features && e.features.length > 0) {
            setSelectedFeature(e.features[0] as unknown as Feature);
          }
        });

        // Change the cursor to a pointer when hovering over a point
        map.current!.on('click', 'Provinces Points', (e) => {
          if (e.features && e.features.length > 0) {
            handleFeatureSelect(e.features[0] as Feature);
          }
        });

        // Change it back to a pointer when it leaves.
        map.current!.on('mouseleave', 'Provinces Points', () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = '';
          }
        });

      } catch (error) {
        console.error('Error loading GeoJSON data:', error);
      }
    });

  }, [center.lng, center.lat, zoom]);

  useEffect(() => {
    if (map.current && selectedFeature) {
      // Remove the 'selected' state from all features
      features.forEach(feature => {
        map.current!.setFeatureState(
          { source: 'Provinces Points', id: feature.id },
          { selected: false }
        );
      });

      // Set the 'selected' state for the selected feature
      map.current.setFeatureState(
        { source: 'Provinces Points', id: selectedFeature.id },
        { selected: true }
      );
    }
  }, [selectedFeature, features]);

  const handleFeatureSelect = (feature: Feature) => {
    setSelectedFeature(feature);
    if (map.current) {
      map.current.flyTo({
        center: feature.geometry.coordinates,
        zoom: 6
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar features={features} selectedFeature={selectedFeature} onFeatureSelect={handleFeatureSelect} />
        <Box ref={mapContainer} sx={{ flexGrow: 1 }} />
      </Box>
    </ThemeProvider>
  );
}