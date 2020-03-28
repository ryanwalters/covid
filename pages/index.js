import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import fetch from "node-fetch";
import Head from "next/head";
import {
  HorizontalGridLines,
  LineSeries,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from "react-vis";
import { Navbar } from "reactstrap";

function transformData(data) {
  return data.map(({ dateChecked, positive: y }) => ({
    x: dayjs(dateChecked),
    y,
  }));
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
      <Navbar>US COVID-19 Cases</Navbar>
      <div className="container" ref={containerRef}>
        <XYPlot width={width} height={400} margin={{ left: 50 }}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis
            title="Date"
            tickFormat={(tick) => dayjs(tick).format("MMM D")}
          />
          <YAxis title="Confirmed Cases" />
          <LineSeries data={transformData(data)} />
        </XYPlot>
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
