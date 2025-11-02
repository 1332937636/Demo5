import { apiRequest } from "@/config/requestApi";
import { fetchGet } from "@/utils/request";
import { handleResponse } from "@/utils/utils";
import { DatePicker, EchartsLine, Icon, Spin } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import * as R from "ramda";
import styles from "../index.less";

const { RangePicker } = DatePicker;

const TrendAnalysis = () => {
  const [isLoading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(
    moment().startOf("month").format("YYYY-MM-DD HH:mm:ss")
  );
  const [endTime, setEndTime] = useState(
    moment().format("YYYY-MM-DD HH:mm:ss")
  );
  const [trendData, setTrendData] = useState({
    categoryData: [],
    seriesData: [],
  });

  function disabledDate(current) {
    return current && current >= moment().endOf("day");
  }

  function onChange(dates, dateStrings) {
    //console.log("change");
    // console.log("From: ", dates[0], ", to: ", dates[1]);
    //console.log("From: ", dateStrings[0], ", to: ", dateStrings[1]);

    if (R.isEmpty(dates)) {
      fetchData(moment().startOf("month").format("YYYY-MM-DD HH:mm:ss"), moment().format("YYYY-MM-DD HH:mm:ss"));
    }

    setStartTime(dateStrings[0]);
    setEndTime(dateStrings[1]);
  }

  function fetchData(start, end) {
    setLoading(true);

    fetchGet(apiRequest.operationManagement.alertTendency, {
      params: {
        query_start_time: start ? start : startTime,
        query_end_time: end ? end : endTime,
        query_type: "normal",
      },
    })
      .then((res) => {
        handleResponse(res, () => setTrendData(res.data));
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchData();
  }, []);

  // useEffect(() => {
  //   console.log("trendData: ", trendData);
  // }, [trendData]);

  return (
    <div className={styles.trendContentWrapper}>
      <Spin spinning={isLoading}>
        <div className={styles.title}>趋势分析</div>
        <div className={styles.trendItemContent}>
          <div className={styles.header}>
            <Icon type="dashboard" theme="twoTone" />
            <div>告警趋势分析</div>
          </div>
          <div className={styles.rangPicker}>
            <RangePicker
              style={{ width: 390 }}
              ranges={{
                今天: [moment().startOf("day"), moment()],
                本周: [moment().startOf("week"), moment()],
                本月: [moment().startOf("month"), moment()],
              }}
              disabledDate={disabledDate}
              showTime={{
                hideDisabledOptions: true,
              }}
              format="YYYY-MM-DD HH:mm"
              onChange={onChange}
              onOk={(dates) => {
                const start = moment(dates[0]).format("YYYY-MM-DD HH:mm:ss");
                const end = moment(dates[1]).format("YYYY-MM-DD HH:mm:ss");
                fetchData(start, end);
              }}
            />
          </div>
          <div>
            <EchartsLine
              data={{
                categoryData: trendData.category_data,
                seriesData: trendData.series_data,
              }}
              option={{
                yAxis: {
                  axisLabel: {
                    formatter: "{value} 次",
                  },
                },
                legend: {
                  bottom: "3",
                },
              }}
            />
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default TrendAnalysis;
