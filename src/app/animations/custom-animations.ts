import { trigger, transition, style, animate, query, stagger, animateChild, sequence, group, state } from "@angular/animations";

export const customAnimation = [
    trigger('items', [
        transition(':enter', [
            style({ transform: 'scale(0.5)', opacity: 0 }),  // initial
            animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)',
                style({ transform: 'scale(1)', opacity: 1 }))  // final
        ]),
        transition(':leave', [
            style({ transform: 'scale(1)', opacity: 1, height: '*' }),
            animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)',
                style({
                    transform: 'scale(0.5)', opacity: 0,
                    height: '0px', margin: '0px'
                }))
        ]),
    ]),
    trigger('offerFade', [
        transition('void=>*', [
            style({ opacity: 0 }),
            animate(1000, style({ opacity: 1 }))
        ]),
        transition('*=>void', [
            style({ opacity: 1 }),
            animate(1000, style({ opacity: 0 }))
        ]),
    ]),
    trigger('list', [
        transition(':enter', [
            query('@items', stagger(300, animateChild()))
        ]),
    ]),
    trigger('rowsAnimation', [
        transition('void => *', [
            style({
                height: '*',
                opacity: '0',
                transform: 'translateX(-550px)',
                'box-shadow': 'none'
            }),
            sequence([
                animate(".25s ease", style({
                    height: '*',
                    opacity: '.2',
                    transform: 'translateX(0)',
                    'box-shadow': 'none'
                })),
                animate(".25s ease", style({
                    height: '*',
                    opacity: 1,
                    transform: 'translateX(0)'
                }))
            ])
        ])
    ]),
    trigger('listAnimation', [
        transition('* <=> *', [
            query(':enter',
                [style({ opacity: 0 }), stagger('100ms', animate('1000ms ease-out', style({ opacity: 1 })))],
                { optional: true }
            ),
            query(':leave',
                animate('2ms', style({ opacity: 0 })),
                { optional: true }
            )
        ])
    ]),
    trigger('itemAnim', [
        transition(':enter', [
            style({ transform: 'translateY(-20%)' }),
            animate(500)
        ]),
        transition(':leave', [
            // group([
            //     animate('0.1s ease', style({ transform: 'translateY(-20%)' })),
            //     animate('0.5s 0.2s ease', style({ opacity: 0 }))
            // ])
            group([
                animate('0.5s ease', style({ transform: 'translateY(-20%)', 'height': '0px' })),
                animate('0.5s 0.2s ease', style({ opacity: 0 }))
            ])
        ])
    ]),
    trigger('fadeSlideInOut', [
        transition(':enter', [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            animate('500ms', style({ opacity: 1, transform: 'translateY(0)' })),
        ]),
        transition(':leave', [
            animate('500ms', style({ opacity: 0, transform: 'translateY(10px)' })),
        ]),
    ]),
    trigger('enterExitLeft', [
        transition(':enter', [
            style({ opacity: 0, transform: 'translateX(-200px)' }),
            animate(
                '300ms ease-in',
                style({ opacity: 1, transform: 'translateX(0)' })
            ),
        ]),
        transition(':leave', [
            animate(
                '300ms ease-in',
                style({ opacity: 0, transform: 'translateX(-200px)' })
            ),
        ]),
    ]),
    trigger('enterExitRight', [
        transition(':enter', [
            style({ opacity: 0, transform: 'translateX(200px)' }),
            animate(
                '300ms ease-in',
                style({ opacity: 1, transform: 'translateX(0)' })
            ),
        ]),
        transition(':leave', [
            animate(
                '1ms ease-in',
                style({ opacity: 0, transform: 'translateX(200px)' })
            ),
        ]),
    ]),
    trigger('container', [
        transition(':enter, :leave', [
            query('@*', animateChild()),
        ]),
    ]),
    trigger('fadeOut', [
        state('void', style({ background: 'pink', borderBottomColor: 'pink', opacity: 0, transform: 'translateX(-550px)', 'box-shadow': 'none' })),
        transition('void => *', sequence([
            animate('.5s ease')
        ])),
        transition('* => void', [animate('5s ease')])
    ]),
    trigger('listAnimation', [
        transition('* => *', [ // each time the binding value changes
            query(':leave', [
                stagger(1, [
                    animate('0.5s', style({ opacity: 0 }))
                ])
            ], { optional: true }),
            query(':enter', [
                style({ opacity: 0 }),
                stagger(100, [
                    animate('0.5s', style({ opacity: 1 }))
                ])
            ], { optional: true })
        ])
    ])
];
