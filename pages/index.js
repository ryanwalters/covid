import { faHome } from '@fortawesome/free-solid-svg-icons/faHome';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import Cookies from 'js-cookie';
import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { Col, FormGroup, CustomInput, Label, Nav, Navbar, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import Graphs from '../components/Graphs';
import { useMounted } from '../hooks/useMounted';

function setStateCookie(state) {
  Cookies.set('state', state, {
    expires: 365,
  });
}

function setTabCookie(tab) {
  Cookies.set('tab', tab, {
    expires: 365,
  });
}

function mapDataToGraphs(data) {
  if (!data) {
    return [];
  }

  // Daily

  const { totalTestResultsIncrease, positiveIncrease, dateChecked } = data[0];

  // 2-week

  let testResultsIncrease2Week = 0;
  let positiveIncrease2Week = 0;

  data.slice(0, 14).forEach(({ totalTestResultsIncrease, positiveIncrease }) => {
    testResultsIncrease2Week += totalTestResultsIncrease;
    positiveIncrease2Week += positiveIncrease;
  });

  return [
    {
      heading: 'Day-over-day',
      subHeading: `New cases since the previous day (${data[0].state || 'US'})`,
      yLabel: 'New Cases',
      positive: data.map(({ dateChecked: x, positiveIncrease: y = 0 }) => ({ x, y })),
      hospitalized: data.map(({ dateChecked: x, hospitalizedIncrease: y = 0 }) => ({ x, y })),
      death: data.map(({ dateChecked: x, deathIncrease: y = 0 }) => ({ x, y })),
      positivityRate2Week: positiveIncrease2Week / testResultsIncrease2Week,
      positivityRateDaily: positiveIncrease / totalTestResultsIncrease,
      dateChecked,
    },
    {
      heading: 'Cumulative',
      subHeading: `Total number of cases (${data[0].state || 'US'})`,
      yLabel: 'Total Cases',
      positive: data.map(({ dateChecked: x, positive: y = 0 }) => ({ x, y })),
      hospitalized: data.map(({ dateChecked: x, hospitalizedCumulative: y = 0 }) => ({ x, y })),
      death: data.map(({ dateChecked: x, death: y = 0 }) => ({ x, y })),
    },
  ];
}

const Tab = {
  US: 'us',
  STATES: 'states',
};
const stateCookie = Cookies.get('state');
const tabCookie = Cookies.get('tab');

const Home = ({ countryGraphs, states }) => {
  const isMounted = useMounted();
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [activeTab, setActiveTab] = useState(tabCookie ?? Tab.US);
  const [selectedState, setSelectedState] = useState(stateCookie ?? states[0]);
  const [selectedStateData, setSelectedStateData] = useState(null);

  // Resize the graph when the container width changes

  useEffect(() => {
    let resizeObserver;

    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(([entry]) => {
        setWidth(entry.contentRect.width);
      });

      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver?.unobserve(containerRef.current);
  }, [containerRef.current]);

  // When selecting a new state, store preference and fetch new data

  useEffect(() => {
    setStateCookie(selectedState);

    fetch(`https://api.covidtracking.com/v1/states/${selectedState.toLowerCase()}/daily.json`)
      .then((response) => response.json())
      .then((selectedStateData) => setSelectedStateData(selectedStateData));
  }, [selectedState]);

  // Save active tab in cookie

  useEffect(() => {
    setTabCookie(activeTab);
  }, [activeTab]);

  function handleOnChange(event) {
    if (event.target.value) {
      setSelectedState(event.target.value);
    }
  }

  return (
    isMounted && (
      <div>
        <Head>
          <title>US COVID-19 Cases</title>
        </Head>
        <Navbar color="dark">
          US COVID-19 Cases
          <a className="text-light" href="https://ryanwalters.dev">
            <FontAwesomeIcon icon={faHome} size="lg" />
          </a>
        </Navbar>
        <div className="container my-4" ref={containerRef}>
          {/* Tabs */}

          <Nav tabs>
            <NavItem>
              <NavLink className={classnames({ active: activeTab === Tab.US })} onClick={() => setActiveTab(Tab.US)}>
                US
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === Tab.STATES })}
                onClick={() => setActiveTab(Tab.STATES)}
              >
                States
              </NavLink>
            </NavItem>
          </Nav>

          {/* Tab content */}

          <TabContent activeTab={activeTab}>
            <TabPane tabId={Tab.US}>
              <Graphs graphs={countryGraphs} width={width} />
            </TabPane>
            <TabPane tabId={Tab.STATES}>
              <FormGroup row className="mt-3">
                <Label for="selectState" xs="auto" className="pr-0">
                  Select state
                </Label>
                <Col xs="auto">
                  <CustomInput
                    type="select"
                    name="selectState"
                    id="selectState"
                    onChange={handleOnChange}
                    value={selectedState}
                  >
                    {states.map((state) => (
                      <option key={state}>{state}</option>
                    ))}
                  </CustomInput>
                </Col>
              </FormGroup>
              <Graphs graphs={mapDataToGraphs(selectedStateData)} width={width} />
            </TabPane>
          </TabContent>
        </div>
      </div>
    )
  );
};

export async function getStaticProps() {
  // Fetch data

  const statesData = await fetch(`https://api.covidtracking.com/v1/states/daily.json`).then((response) =>
    response.json()
  );
  const countryData = await fetch('https://api.covidtracking.com/v1/us/daily.json').then((response) => response.json());

  // Grab all the states to display in the dropdown

  const states = new Set();

  statesData.forEach(({ state }) => states.add(state));

  const statesArray = Array.from(states);

  return {
    revalidate: 3600,
    props: {
      countryGraphs: mapDataToGraphs(countryData),
      states: statesArray,
    },
  };
}

export default Home;
