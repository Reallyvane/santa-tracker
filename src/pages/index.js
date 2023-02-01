import Head from "next/head";
import useSWR from "swr";

import Layout from "@components/Layout";
import Section from "@components/Section";
import Container from "@components/Container";
import Map from "@components/Map";


import styles from "@styles/Home.module.scss";


const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data } = useSWR(
    "https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_en.json?alt=media&2018b",
    fetcher
  );

  //const currentDate = new Date('2023-12-25T02:34:30.115Z');
  const currentDate = new Date(Date.now());
  const currentYear = currentDate.getFullYear();

  const destinations = data?.destinations.map((destination) => {
    const { arrival, departure } = destination;

    const arrivalDate = new Date(arrival);
    const departureDate = new Date(departure);

    arrivalDate.setFullYear(currentYear);
    departureDate.setFullYear(currentYear);

    return {
      ...destination,
      arrival: arrivalDate.getTime(),
      departure: departureDate.getTime(),
    };
  });

  return (
    <Layout>
      <Head>
        <title>Santa Tracker</title>
        <meta
          name="description"
          content="Track Santa's current location and arrival and departure times"
        />
        <link rel="icon" href="./images/santa-marker-icon.png" />
      </Head>

      <Section>
        <Container>
          <Map
            className={styles.homeMap}
            width="800"
            height="400"
            center={[0, 0]}
            zoom={1}
          >
            {({ TileLayer, Marker, Popup }, Leaflet) => (
              <>
                <TileLayer
                  url="https://api.mapbox.com/styles/v1/nesdevs/cldm63fi9002j01tbbi1g8xr0/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibmVzZGV2cyIsImEiOiJjbGRtNjg4d3gwNmNmM3ZvOW9weXUxZ3c1In0.BZLZO4y8ZFDYCYoaOsqFTA"
                  attribution="© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>"
                />
                {destinations?.map(
                  ({ id, arrival, departure, location, city, region }) => {
                    const arrivalDate = new Date(arrival);
                    const arrivalHours = arrivalDate.getHours();
                    const arrivalMinutes = arrivalDate.getMinutes();
                    const arrivalTime = `${arrivalHours}:${arrivalMinutes}`;

                    const departureDate = new Date(departure);
                    const departureHours = departureDate.getHours();
                    const departureMinutes = departureDate.getMinutes();
                    const departureTime = `${departureHours}:${departureMinutes}`;

                    const santaWasHere =
                      currentDate.getTime() - departureDate.getTime() > 0;
                    const santaIsHere =
                      currentDate.getTime() - arrivalDate.getTime() > 0 &&
                      !santaWasHere;

                    let iconUrl = "/images/tree-marker-icon.png";
                    let iconRetinaUrl = "/images/tree-marker-icon-2x.png";

                    if (santaWasHere) {
                      iconUrl = "/images/gift-marker-icon.png";
                      iconRetinaUrl = "/images/gift-marker-icon-2x.png";
                    }

                    if (santaIsHere) {
                      iconUrl = "/images/santa-marker-icon.png";
                      iconRetinaUrl = "/images/santa-marker-icon-2x.png";
                    }

                    let className = "";

                    if (santaIsHere) {
                      className = `${className} ${styles.iconSantaIsHere}`;
                    }

                    return (
                      <Marker
                        key={id}
                        position={[location.lat, location.lng]}
                        icon={Leaflet.icon({
                          iconUrl,
                          iconRetinaUrl,
                          iconSize: [41, 41],
                          className,
                        })}
                      >
                        <Popup>
                          <strong>Location:</strong> {city}, {region}
                          <br />
                          <strong>
                            Arrival:
                          </strong> {arrivalDate.toDateString()} @ {arrivalTime}
                          <br />
                          <strong>Departure:</strong>{" "}
                          {arrivalDate.toDateString()} @ {departureTime}
                        </Popup>
                      </Marker>
                    );
                  }
                )}
              </>
            )}
          </Map>
        </Container>
      </Section>
    </Layout>
  );
}
