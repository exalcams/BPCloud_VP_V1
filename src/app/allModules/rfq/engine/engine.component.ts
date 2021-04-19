import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ChartType } from 'chart.js';
import { MatTableDataSource } from '@angular/material';
import * as Chart from 'chart.js';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html',
  styleUrls: ['./engine.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class EngineComponent implements OnInit {

  array1: any = [];
  i: number;
  a: any = 1;
  b: any = "#f3705a";
  color_75: any = [];
  color_90: any = [];



  radius = 50;
  circumference = 2 * Math.PI * this.radius;
  dashoffset1: number;
  dashoffset2: number;
  progressPercentage1 = 0;
  progressPercentage2 = 0;
  nextProcess: string;




  //doughnut chart
  public doughnutChartOptions = {
    responsive: false,
    maintainAspectRatio: false,
    legend: {
      position: 'left',
      labels: {
        fontSize: 12,
        fontWeight: 500,
        padding: 20,
        usePointStyle: true
      }
    },
    cutoutPercentage: 80,
    elements: {
      arc: {
        borderWidth: 0
      }
    },
    plugins: {
      labels: {

        render: function (args) {
          return args.value + '%';
        },
        fontColor: '#000',
        position: 'outside'
      }
    }
  };
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartLabels: any[] = ['Invited', 'Responded', 'Evaluated', 'Awarded'];
  public doughnutChartData: any[] = [
    [40, 20, 30, 10]
  ];

  public colors: any[] = [{ backgroundColor: ['#fb863a', '#40a8e2', '#485865', '#40ed9a'] }];

  // Bar chart
  public barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        fontSize: 10,
        usePointStyle: true
      }
    },

    scales: {
      xAxes: [{
        barPercentage: 1.3,
        categoryPercentage: -0.5
      }],
      yAxes: [{
        ticks: {
          stepSize: 25,
          beginAtZero: true
        }
      }],
    },
    plugins: {
      labels: {
        // tslint:disable-next-line:typedef
        render: function (args) {
          return args.value + '%';
        },
        fontColor: '#000',
        position: 'outside'
      }
    }

  };
  @ViewChild('barCanvas') barCanvas: ElementRef;
  public barChartLabels: any[] = ['17/02/20', '18/02/20', '19/02/20', '20/02/20', '21/02/20'];


  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartData: any[] = [
    { data: [45, 70, 65, 20, 80], label: 'Actual' },
    { data: [87, 50, 40, 71, 56], label: 'Planned' }
  ];
  public barColors: any[] = [{ backgroundColor: '#40a8e2' }, { backgroundColor: '#fb863a' }];


  //table

  RFQDisplayedColumns: string[] = ['Type', 'RFQID', 'Date', 'full', 'Next'];
  RFQDataSource = new MatTableDataSource<RFQData>(RFQDetails);



  constructor() { }

  ngOnInit(): void {
    for (this.i = 0; this.i <= 100; this.i++) {
      this.array1[this.i] = this.a;
    }


    for (this.i = 0; this.i <= 75; this.i++) {
      this.color_75[this.i] = this.b
    }
    for (this.i = 0; this.i <= 90; this.i++) {
      this.color_90[this.i] = this.b
    }
    new Chart('doughnut1', {
      type: 'doughnut',
      options: {
        responsive: false,
        maintainAspectRatio: false,
        cutoutPercentage: 70,

        plugins: {
          labels: false
        },

        title: {
          display: false,
          text: 'Doughnut chart'

        },

        legend: {
          display: false,
          position: 'top'

        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      },
      data: {
        datasets: [{
          data: this.array1,
          backgroundColor: this.color_75,


          label: 'dataset1'

        }

        ],



      }
    })
  }

}
export interface RFQData {
  Type: any;
  RFQID: any;
  Date: any;


}
const RFQDetails: RFQData[] = [
  {
    Type: 'AN', RFQID: '600000075', Date: '12/08/2020'
  },
  {
    Type: 'AN', RFQID: '600000075', Date: '12/08/2020'
  },
  {
    Type: 'AN', RFQID: '600000075', Date: '12/08/2020'
  },
  {
    Type: 'AN', RFQID: '600000075', Date: '12/08/2020'
  }, {
    Type: 'AN', RFQID: '600000075', Date: '12/08/2020'
  }, {
    Type: 'AN', RFQID: '600000075', Date: '12/08/2020'
  },
]