import { GoogleMap, LoadScript, MarkerF } from "@react-google-maps/api";
import CategoryLocations from "./CategoryLocations";

const containerStyle = {
  width: "100%",
  height: "100%",
  position: "relative",
  zIndex: 1,
};

const center = {
  lat: 38.6280278,
  lng: -90.1910154,
};

function Map({ results }) {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API}> {/* Use NEXT_PUBLIC_ variable */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        options={{
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        <MarkerF
          position={center}
          icon={{
            url: `/YourLocation.png`,
            scaledSize: { width: 30, height: 30 },
          }}
        />
        <CategoryLocations results={results} />
      </GoogleMap>
    </LoadScript>
  );
}

export default Map;
