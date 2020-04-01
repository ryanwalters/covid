import dayjs from 'dayjs';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import fetch from 'node-fetch';
import Head from 'next/head';
import { Crosshair, DiscreteColorLegend, HorizontalGridLines, LineSeries, XAxis, XYPlot, YAxis } from 'react-vis';
import { Navbar } from 'reactstrap';

const Home = ({ data, graphs }) => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [crosshair, setCrosshair] = useState([]);

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

  function onNearestX(value, data) {
    console.log(value, data);
  }

  function transformData(data) {
    return data.map((item) => ({
      ...item,
      x: dayjs(item.x),
    }));
  }

  return (
    <div>
      <Head>
        <title>US COVID-19 Cases</title>
      </Head>
      <Navbar color="dark">US COVID-19 Cases</Navbar>
      <div className="container mb-5" ref={containerRef}>
        {graphs.map(({ heading, subHeading, yLabel, positive, hospitalized, death }) => (
          <Fragment key={heading}>
            <h3 className="mt-3">{heading}</h3>
            <div className="font-weight-light">{subHeading}</div>
            <XYPlot width={width} height={400} margin={{ left: 60 }} onMouseLeave={() => setCrosshair([])}>
              <HorizontalGridLines style={{ opacity: 0.1 }} />
              <XAxis title="Date" tickFormat={(tick) => dayjs(tick).format('M/D')} />
              <YAxis title={yLabel} />
              <LineSeries data={transformData(positive)} curve="curveBasis" onNearestX={onNearestX} />
              <LineSeries data={transformData(hospitalized)} curve="curveBasis" />
              <LineSeries data={transformData(death)} curve="curveBasis" stroke="burlywood" />
              <Crosshair values={crosshair} />
            </XYPlot>
            <DiscreteColorLegend items={['Confirmed Cases', 'Hospitalized', { title: 'Deaths', color: 'burlywood' }]} />
          </Fragment>
        ))}
        {process.env.NODE_ENV !== 'production' && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  const data = await fetch('https://covidtracking.com/api/us/daily').then((response) => response.json());
  const graphs = [
    {
      heading: 'Cumulative',
      subHeading: 'Total number of cases (US)',
      yLabel: 'Total Cases',
      positive: data.map(({ dateChecked: x, positive: y }) => ({ x, y })),
      hospitalized: data.map(({ dateChecked: x, hospitalized: y }) => ({ x, y })),
      death: data.map(({ dateChecked: x, death: y }) => ({ x, y })),
    },
    {
      heading: 'Day-over-day',
      subHeading: 'New cases since the previous day (US)',
      yLabel: 'New Cases',
      positive: data.map(({ dateChecked: x, positiveIncrease: y }) => ({ x, y })),
      hospitalized: data.map(({ dateChecked: x, hospitalizedIncrease: y }) => ({ x, y })),
      death: data.map(({ dateChecked: x, deathIncrease: y }) => ({ x, y })),
    },
  ];

  return {
    props: {
      data,
      graphs,
    },
  };
}

export default Home;
