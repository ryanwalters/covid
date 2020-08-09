import dayjs from 'dayjs';
import React, { Fragment } from 'react';
import { Crosshair, DiscreteColorLegend, HorizontalGridLines, LineSeries, XAxis, XYPlot, YAxis } from 'react-vis';

const Graphs = ({ graphs, width }) => {
  function transformData(data) {
    return data.map((item) => ({
      ...item,
      x: dayjs(item.x),
    }));
  }

  return graphs.map(({ heading, subHeading, yLabel, positive, hospitalized, death, positivityRate, lastUpdateEt }) => (
    <Fragment key={heading}>
      <h3 className="mt-3">{heading}</h3>
      {positivityRate && lastUpdateEt && (
        <div className="font-weight-light">
          Positivity rate for {dayjs(lastUpdateEt).format('M/D')}: {`${parseFloat(positivityRate * 100).toFixed(2)}%`}
        </div>
      )}
      <div className="font-weight-light">{subHeading}</div>
      <XYPlot width={width} height={400} margin={{ left: 70 }}>
        <HorizontalGridLines style={{ opacity: 0.1 }} />
        <XAxis title="Date" tickFormat={(tick) => dayjs(tick).format('M/D')} />
        <YAxis title={yLabel} />
        <LineSeries data={transformData(positive)} curve="curveBasis" />
        <LineSeries data={transformData(hospitalized)} curve="curveBasis" />
        <LineSeries data={transformData(death)} curve="curveBasis" stroke="burlywood" />
      </XYPlot>
      <DiscreteColorLegend items={['Confirmed Cases', 'Hospitalized', { title: 'Deaths', color: 'burlywood' }]} />
    </Fragment>
  ));
};

export default Graphs;
