import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import fetch from "node-fetch";
import Head from "next/head";
import {
  Crosshair,
  Hint,
  HorizontalGridLines,
  LineSeries,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from "react-vis";
import { Navbar } from "reactstrap";

const Home = ({ data, graphs }) => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [crosshair, setCrosshair] = useState(null);

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

  function onNearestXY(value, data) {
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
        {graphs.map(({ heading, subHeading, yLabel, data }) => (
          <>
            <h3 className="mt-3">{heading}</h3>
            <div className="font-weight-light">{subHeading}</div>
            <XYPlot width={width} height={400} margin={{ left: 60 }}>
              <HorizontalGridLines style={{ opacity: 0.1 }} />
              <XAxis
                title="Date"
                tickFormat={(tick) => dayjs(tick).format("MMM D")}
              />
              <YAxis title={yLabel} />
              <LineSeries
                data={transformData(data)}
                curve="curveBasis"
                onNearestXY={onNearestXY}
              />
              {/*<Crosshair values={data} itemsFormat={items => items.map(({ positive: value }) => ({ value }))} />*/}
              {/*<Hint value={data} format={items => items.map(item => ({ title: dayjs(item.dateChecked).format('MMM D'), value: item.positive }))} />*/}
            </XYPlot>
          </>
        ))}
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  const data = await fetch(
    "https://covidtracking.com/api/us/daily"
  ).then((response) => response.json());
  const graphs = [
    {
      heading: "Cumulative",
      subHeading: "Total number of confirmed cases",
      yLabel: "Total Cases",
      data: data.map(({ dateChecked: x, positive: y }) => ({ x, y })),
    },
    {
      heading: "Day-over-day",
      subHeading: "New confirmed cases since the previous day",
      yLabel: "New Cases",
      data: data.map(({ dateChecked: x, positiveIncrease: y }) => ({ x, y })),
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
