import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  SkeletonText,
  Text,
} from '@chakra-ui/react'
import { FaLocationArrow, FaTimes } from 'react-icons/fa'
import {
  useJsApiLoader,
  GoogleMap,
  Autocomplete,
  DirectionsRenderer,
  Polyline
} from '@react-google-maps/api'
import { useEffect, useRef, useState } from 'react'

const center = {
  lat: 38.9531162,
  lng: -77.45653879999999
};

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyDizxBF7m-OJ31K91TXGKG5ZKgVHpaic6U',
    libraries: ['places'],
  })

  const [map, setMap] = useState((!!null))
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [final, setfinal] = useState([])
  const [data, setdata] = useState([])

  const originRef = useRef()
  const destinationRef = useRef()

  useEffect(() => {
    if (final?.length > 0) {
      final?.map(async (val) => {
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${val}&key=AIzaSyDizxBF7m-OJ31K91TXGKG5ZKgVHpaic6U`);
        const result = await res.json();
        setdata((prevVal) => [...prevVal, result.results[0].geometry.location])
      })
    }
  }, [final])

  if (!isLoaded) {
    return <SkeletonText />
  }

  const calculateRoute = async () => {
    if (originRef.current.value === '' || destinationRef.current.value === '') {
      return
    }
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    })
    const originDestination = []
    if (results) {
      originDestination.push(results.request.origin.query)
      originDestination.push(results.request.destination.query)
      setfinal(originDestination);
    }
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
  }

  const clearRoute = () => {
    setDirectionsResponse(null)
    setDistance('')
    setDuration('')
    originRef.current.value = ''
    destinationRef.current.value = ''
  }

  const options = {
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: 30000,
    zIndex: 1,
    icons: [{
      icon: "",
      offset: '0',
      repeat: '10px'
    }],
  };

  return (
    <Flex
      position='relative'
      flexDirection='column'
      alignItems='center'
      h='100vh'
      w='100vw'
    >
      <Box position='absolute' left={0} top={0} h='100%' w='100%'>
        <GoogleMap
          center={center}
          zoom={5}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={(map) => setMap(map)}
        >

          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
          <Polyline
            path={data}
            options={options}

          />

        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius='lg'
        m={4}
        bgColor='white'
        shadow='base'
        minW='container.md'
        zIndex='1'
      >
        <HStack spacing={2} justifyContent='space-between'>
          <Box flexGrow={1}>
            <Autocomplete options={{ strictBounds: true }} types={["airport"]} restrictions={{ country: ["us"] }}>
              <Input type='text' placeholder='Origin' ref={originRef} />
            </Autocomplete>
          </Box>
          <Box flexGrow={1}>
            <Autocomplete options={{ strictBounds: true }} types={["airport"]} restrictions={{ country: ["us"] }}>
              <Input
                type='text'
                placeholder='Destination'
                ref={destinationRef}
              />
            </Autocomplete>
          </Box>

          <ButtonGroup>
            <Button colorScheme='yellow' type='submit' onClick={calculateRoute}>
              Calculate Route
            </Button>
            <IconButton
              aria-label='center back'
              icon={<FaTimes />}
              onClick={clearRoute}
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent='space-between'>
          <Text>Distance: {distance} </Text>
          <Text>Duration: {duration} </Text>
          <IconButton
            aria-label='center back'
            icon={<FaLocationArrow />}
            isRound
            onClick={() => {
              map.panTo(center)
              map.setZoom(15)
            }}
          />
        </HStack>
      </Box>
    </Flex>
  )
}

export default App
