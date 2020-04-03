import classnames from 'classnames';
import dayjs from 'dayjs';
import cookie from 'js-cookie';
import React, { useEffect, useRef, useState } from 'react';
import fetch from 'node-fetch';
import Head from 'next/head';
import { Col, FormGroup, Input, Label, Nav, Navbar, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import Graphs from '../components/Graphs';

function mapDataToGraphs(data) {
  if (!data) {
    return [];
  }

  return [
    {
      heading: 'Cumulative',
      subHeading: `Total number of cases (${data.state || 'US'})`,
      yLabel: 'Total Cases',
      positive: data.map(({ dateChecked: x, positive: y }) => ({ x, y })),
      hospitalized: data.map(({ dateChecked: x, hospitalized: y }) => ({ x, y })),
      death: data.map(({ dateChecked: x, death: y }) => ({ x, y })),
    },
    {
      heading: 'Day-over-day',
      subHeading: `New cases since the previous day (${data.state || 'US'})`,
      yLabel: 'New Cases',
      positive: data.map(({ dateChecked: x, positiveIncrease: y }) => ({ x, y })),
      hospitalized: data.map(({ dateChecked: x, hospitalizedIncrease: y }) => ({ x, y })),
      death: data.map(({ dateChecked: x, deathIncrease: y }) => ({ x, y })),
    },
  ];
}

const Tab = {
  US: 'us',
  STATES: 'states',
};

const Home = ({ countryData, statesData, countryGraphs, states }) => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [activeTab, setActiveTab] = useState(cookie.get('tab') || Tab.US);
  const [selectedState, setSelectedState] = useState(cookie.get('state'));
  const [selectedStateData, setSelectedStateData] = useState();

  // Resize the graph when the container width changes

  useEffect(() => {
    let resizeObserver;

    if (containerRef.current) {
      resizeObserver = new ResizeObserver(([entry]) => {
        setWidth(entry.contentRect.width);
      });

      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.unobserve(containerRef.current);
  }, [containerRef.current]);

  // Save selected state in a cookie

  useEffect(() => {
    cookie.set('state', selectedState);

    setSelectedStateData(statesData.filter(({ state }) => state === selectedState));
  }, [selectedState]);

  // Save active tab in cookie

  useEffect(() => {
    cookie.set('tab', activeTab);
  }, [activeTab]);

  function handleOnChange(event) {
    setSelectedState(event.target.value);
  }

  return (
    <div>
      <Head>
        <title>US COVID-19 Cases</title>
      </Head>
      <Navbar color="dark">US COVID-19 Cases</Navbar>
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
              <Label for="selectState" xs="auto">
                Select state
              </Label>
              <Col xs="auto">
                <Input
                  type="select"
                  name="selectState"
                  id="selectState"
                  onChange={handleOnChange}
                  value={selectedState}
                >
                  {states.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </Input>
              </Col>
            </FormGroup>
            <Graphs graphs={mapDataToGraphs(selectedStateData)} width={width} />
          </TabPane>
        </TabContent>

        {process.env.NODE_ENV !== 'production' && (
          <>
            <h4>Country data</h4>
            <pre>{JSON.stringify(countryData, null, 2)}</pre>
            <h4>State data</h4>
            <pre>{JSON.stringify(statesData, null, 2)}</pre>
          </>
        )}
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  // Fetch data

  const statesData = await fetch('https://covidtracking.com/api/v1/states/daily.json').then((response) =>
    response.json()
  );
  const countryData = await fetch('https://covidtracking.com/api/us/daily').then((response) => response.json());

  // Parse individual states

  const states = new Set();

  statesData.forEach(({ state }) => states.add(state));

  return {
    props: {
      countryData,
      statesData,
      countryGraphs: mapDataToGraphs(countryData),
      states: Array.from(states),
    },
  };
}

export default Home;
