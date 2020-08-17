import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import dayjs from 'dayjs';
import React, { Fragment } from 'react';
import { Crosshair, DiscreteColorLegend, HorizontalGridLines, LineSeries, XAxis, XYPlot, YAxis } from 'react-vis';
import { UncontrolledTooltip } from 'reactstrap';

const Graphs = ({ graphs, width }) => {
  function transformData(data) {
    return data.map((item) => ({
      ...item,
      x: dayjs(item.x),
    }));
  }

  return graphs.map(
    ({
      heading,
      subHeading,
      yLabel,
      positive,
      hospitalized,
      death,
      positivityRateDaily,
      positivityRate2Week,
      dateChecked,
    }) => {
      const positivityPercentage2Week = parseFloat(positivityRate2Week * 100).toFixed(2);
      const positivityPercentageDaily = parseFloat(positivityRateDaily * 100).toFixed(2);

      return (
        <Fragment key={heading}>
          <h3 className="mt-3">{heading}</h3>
          {(positivityRateDaily || positivityRate2Week) && (
            <div>
              Positivity Rate:
              <FontAwesomeIcon icon={faQuestionCircle} className="ml-2 text-light" id="positivityQuestion" />
              <UncontrolledTooltip target="positivityQuestion">WHO recommends 5% or lower</UncontrolledTooltip>
            </div>
          )}
          {positivityRateDaily && dateChecked && (
            <div>
              &mdash; Daily ({dayjs(dateChecked).format('MMM D')}):
              <span
                className={classnames(
                  'lead font-weight-bold ml-1 d-inline-flex align-items-center',
                  positivityPercentageDaily > 5 ? 'text-warning' : 'text-success'
                )}
              >
                {`${positivityPercentageDaily}%`}
              </span>
            </div>
          )}
          {positivityRate2Week && dateChecked && (
            <div>
              &mdash; 2-week:
              <span
                className={classnames(
                  'lead font-weight-bold ml-1 d-inline-flex align-items-center',
                  positivityPercentage2Week > 5 ? 'text-warning' : 'text-success'
                )}
              >
                {`${positivityPercentage2Week}%`}
              </span>
            </div>
          )}
          <div className="font-weight-light mt-2">{subHeading}</div>
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
      );
    }
  );
};

export default Graphs;
