var endTime = function (time, expr) {
    switch (expr.tag) {
        case 'note':
        case 'rest': return time + expr.dur;
        case 'par': return Math.max(endTime(time, expr.left), endTime(time, expr.right));
        case 'seq': return (time = endTime(time, expr.left)) && endTime(time, expr.right);
        case 'repeat': return time + expr.count * (endTime(time, expr.section) - time);
    }
};

var getMidiPitch = function (note) {
    return 12 + note.charAt(1) * 12 + "c d ef g a b".indexOf(note.charAt(0).toLowerCase());
};

var compileExprNode = function (expr, time, notes) {
    var i, t;

    switch (expr.tag) {
        case 'note':
            notes.push({
                tag: 'note',
                pitch: getMidiPitch(expr.pitch),
                start: time,
                dur: expr.dur
            });
            break;

        case 'rest':
            notes.push({
                tag: 'rest',
                start: time,
                dur: expr.dur
            });
            break;
            
        case 'par':
            compileExprNode(expr.left, time, notes);
            compileExprNode(expr.right, time, notes);
            break;
            
        case 'seq':
            compileExprNode(expr.left, time, notes);
            time = endTime(time, expr.left);
            compileExprNode(expr.right, time, notes);
            break;
            
        case 'repeat':
            t = endTime(time, expr.section) - time;
            for (i = 0; i < expr.count; ++i) {
            	compileExprNode(expr.section, time, notes);
            	time += t;
            }
            break;
    }
};

var compile = function (expr) {
    var notes = [];
    
    compileExprNode(expr, 0, notes);
    return notes;
};

/**************************** TESTS ****************************/

var melody_mus = {
    tag: 'seq',
    left: {
        tag: 'seq',
        left: {
            tag: 'note',
            pitch: 'a4',
            dur: 250
        },
        right: {
            tag: 'note',
            pitch: 'b4',
            dur: 250
        }
    },
    right: {
        tag: 'seq',
        left: {
            tag: 'repeat',
            section: {
                tag: 'note',
                pitch: 'c4',
                dur: 250
            },
            count: 3
        },
        right: {
            tag: 'note',
            pitch: 'd4',
            dur: 500
        }
    }
};

console.log(melody_mus);
console.log(compile(melody_mus));