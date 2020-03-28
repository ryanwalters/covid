import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import fetch from "node-fetch";
import Head from "next/head";
import {
  Hint,
  HorizontalGridLines,
  LineSeries,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from "react-vis";
import { Navbar } from "reactstrap";

function transformCumulativeData(data) {
  return data.map(({ dateChecked, positive: y }) => ({
    x: dayjs(dateChecked),
    y,
  }));
}

function transformDayOverDay(data) {
  return data.map(({ dateChecked, positiveIncrease: y }) => ({
    x: dayjs(dateChecked),
    y,
  }));
}

function transformPositiveHints(data) {
  console.log(data);
  return data.map(({ positive: value }) => ({ label: "Positive", value }));
  //return data.map(({ positive: value }) => ({ value }));
}

const Home = ({ data }) => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

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

  return (
    <div>
      <Head>
        <title>US COVID-19 Cases</title>
      </Head>
      <Navbar color="dark">US COVID-19 Cases</Navbar>
      <div className="container" ref={containerRef}>
        <h3 className="mt-3">Cumulative</h3>
        <XYPlot width={width} height={400} margin={{ left: 50 }}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis
            title="Date"
            tickFormat={(tick) => dayjs(tick).format("MMM D")}
          />
          <YAxis title="Total Confirmed Cases" />
          <LineSeries data={transformCumulativeData(data)} curve="curveBasis" />
          {/*<Hint value={data} format={transformPositiveHints} />*/}
        </XYPlot>
        <h3 className="mt-3">Day-over-day</h3>
        <XYPlot width={width} height={400} margin={{ left: 50 }}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis tickFormat={(tick) => dayjs(tick).format("MMM D")} />
          <YAxis title="New Confirmed Cases" />
          <LineSeries data={transformDayOverDay(data)} curve="curveBasis" />
        </XYPlot>
        {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  return {
    props: {
      data: await fetch(
        "https://covidtracking.com/api/us/daily"
      ).then((response) => response.json()),
    },
  };
}

export default Home;
