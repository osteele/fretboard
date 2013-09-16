require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ChordDiagram, Chords, IntervalNames, Layout, LongIntervalNames, Modes, NoteNames, Scales, app, best_fingering_for, finger_positions_on_chord, fingerings_for, interval_class_between, _ref, _ref1;

ChordDiagram = require('./chord_diagram');

Layout = require('./layout');

_ref = require('./fretboard_logic'), best_fingering_for = _ref.best_fingering_for, fingerings_for = _ref.fingerings_for, finger_positions_on_chord = _ref.finger_positions_on_chord;

_ref1 = require('./theory'), Chords = _ref1.Chords, NoteNames = _ref1.NoteNames, IntervalNames = _ref1.IntervalNames, LongIntervalNames = _ref1.LongIntervalNames, Modes = _ref1.Modes, Scales = _ref1.Scales, interval_class_between = _ref1.interval_class_between;

angular.element(document).ready(function() {
  return angular.bootstrap(document, ['FretboardApp']);
});

app = angular.module('FretboardApp', []);

app.controller('ChordCtrl', function($scope) {});

app.directive('chord', function() {
  return {
    restrict: 'CE',
    replace: true,
    template: '<canvas width="90" height="100"/>',
    transclude: true,
    scope: {
      name: '@'
    },
    link: function(scope, element, attrs) {
      var canvas;
      canvas = element[0];
      return attrs.$observe('name', function(chordName) {
        var chord, ctx, fingering, fingerings;
        chord = Chords.Major.at('E');
        fingerings = fingerings_for(chord);
        fingering = fingerings[0];
        ctx = canvas.getContext('2d');
        return ChordDiagram.draw(ctx, fingering.positions, {
          barres: fingering.barres
        });
      });
    }
  };
});


},{"./chord_diagram":"kgIvBT","./fretboard_logic":"YoMTGX","./layout":"ThjNWR","./theory":"AmyBcu"}],"8QyYb9":[function(require,module,exports){



},{}],"kgIvBT":[function(require,module,exports){
var DefaultStyle, FretCount, FretNumbers, Layout, SmallStyle, StringCount, StringNumbers, compute_dimensions, draw_chord_block, draw_chord_diagram, draw_chord_diagram_frets, draw_chord_diagram_strings, hsv2css, _, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

_ref = require('./fretboard_model'), FretCount = _ref.FretCount, FretNumbers = _ref.FretNumbers, StringCount = _ref.StringCount, StringNumbers = _ref.StringNumbers;

Layout = require('./layout');

hsv2css = require('./utils').hsv2css;

SmallStyle = {
  h_gutter: 5,
  v_gutter: 5,
  string_spacing: 6,
  fret_height: 8,
  above_fretboard: 8,
  note_radius: 1,
  closed_string_fontsize: 4,
  chord_degree_colors: ['red', 'blue', 'green', 'orange'],
  interval_class_colors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function(n) {
    return hsv2css({
      h: n * 360 / 12,
      s: 1,
      v: 1
    });
  })
};

DefaultStyle = _.extend({}, SmallStyle, {
  string_spacing: 12,
  fret_height: 16,
  note_radius: 3,
  closed_string_fontsize: 8
});

compute_dimensions = function(style) {
  if (style == null) {
    style = DefaultStyle;
  }
  return {
    width: 2 * style.h_gutter + (StringCount - 1) * style.string_spacing,
    height: 2 * style.v_gutter + (style.fret_height + 2) * FretCount
  };
};

draw_chord_diagram_strings = function(ctx, options) {
  var string, style, x, _i, _len, _results;
  if (options == null) {
    options = {};
  }
  style = DefaultStyle;
  _results = [];
  for (_i = 0, _len = StringNumbers.length; _i < _len; _i++) {
    string = StringNumbers[_i];
    x = string * style.string_spacing + style.h_gutter;
    ctx.beginPath();
    ctx.moveTo(x, style.v_gutter + style.above_fretboard);
    ctx.lineTo(x, style.v_gutter + style.above_fretboard + FretCount * style.fret_height);
    ctx.strokeStyle = (options.dim_strings && __indexOf.call(options.dim_strings, string) >= 0 ? 'rgba(0,0,0,0.2)' : 'black');
    _results.push(ctx.stroke());
  }
  return _results;
};

draw_chord_diagram_frets = function(ctx, _arg) {
  var fret, nut, style, y, _i, _len, _results;
  nut = (_arg != null ? _arg : {
    nut: true
  }).nut;
  style = DefaultStyle;
  ctx.strokeStyle = 'black';
  _results = [];
  for (_i = 0, _len = FretNumbers.length; _i < _len; _i++) {
    fret = FretNumbers[_i];
    y = style.v_gutter + style.above_fretboard + fret * style.fret_height;
    ctx.beginPath();
    ctx.moveTo(style.v_gutter - 0.5, y);
    ctx.lineTo(style.v_gutter + 0.5 + (StringCount - 1) * style.string_spacing, y);
    if (fret === 0 && nut) {
      ctx.lineWidth = 3;
    }
    ctx.stroke();
    _results.push(ctx.lineWidth = 1);
  }
  return _results;
};

draw_chord_diagram = function(ctx, positions, options) {
  var barres, defaults, draw_barres, draw_closed_strings, draw_finger_position, draw_finger_positions, dy, finger_coordinates, string, style, used_strings;
  if (options == null) {
    options = {};
  }
  defaults = {
    draw_closed_strings: true,
    nut: true,
    dy: 0,
    style: DefaultStyle
  };
  options = _.extend(defaults, options);
  barres = options.barres, dy = options.dy, draw_closed_strings = options.draw_closed_strings, style = options.style;
  if (options.dim_unused_strings) {
    used_strings = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = positions.length; _i < _len; _i++) {
        string = positions[_i].string;
        _results.push(string);
      }
      return _results;
    })();
    options.dim_strings = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = StringNumbers.length; _i < _len; _i++) {
        string = StringNumbers[_i];
        if (__indexOf.call(used_strings, string) < 0) {
          _results.push(string);
        }
      }
      return _results;
    })();
  }
  finger_coordinates = function(_arg) {
    var fret, string;
    string = _arg.string, fret = _arg.fret;
    return {
      x: style.h_gutter + string * style.string_spacing,
      y: style.v_gutter + style.above_fretboard + (fret - 0.5) * style.fret_height + dy
    };
  };
  draw_finger_position = function(position, options) {
    var color, is_root, x, y, _ref1;
    if (options == null) {
      options = {};
    }
    is_root = options.is_root, color = options.color;
    _ref1 = finger_coordinates(position), x = _ref1.x, y = _ref1.y;
    ctx.fillStyle = color || (is_root ? 'red' : 'white');
    ctx.strokeStyle = color || (is_root ? 'red' : 'black');
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (is_root && position.fret) {
      (function(r) {
        return ctx.rect(x - r, y - r, 2 * r, 2 * r);
      })(style.note_radius);
    } else {
      ctx.arc(x, y, style.note_radius, 0, Math.PI * 2, false);
    }
    if (position.fret > 0 || is_root) {
      ctx.fill();
    }
    return ctx.stroke();
  };
  draw_barres = function() {
    var eccentricity, fret, string_count, w, x1, x2, y, _fn, _fn1, _i, _len, _ref1, _ref2, _results;
    ctx.fillStyle = 'black';
    _fn = function() {
      ctx.save();
      ctx.scale(w, eccentricity);
      ctx.arc(0, 0, style.string_spacing / 2 / eccentricity, Math.PI, 0, false);
      return ctx.restore();
    };
    _fn1 = function() {
      ctx.save();
      ctx.scale(w, 14);
      ctx.arc(0, 0, style.string_spacing / 2 / eccentricity, 0, Math.PI, true);
      return ctx.restore();
    };
    _results = [];
    for (_i = 0, _len = barres.length; _i < _len; _i++) {
      _ref1 = barres[_i], fret = _ref1.fret, string = _ref1.string, fret = _ref1.fret, string_count = _ref1.string_count;
      _ref2 = finger_coordinates({
        string: string,
        fret: fret
      }), x1 = _ref2.x, y = _ref2.y;
      x2 = finger_coordinates({
        string: string + string_count - 1,
        fret: fret
      }).x;
      w = x2 - x1;
      ctx.save();
      ctx.translate((x1 + x2) / 2, y - style.fret_height * .25);
      ctx.beginPath();
      eccentricity = 10;
      _fn();
      _fn1();
      ctx.fill();
      _results.push(ctx.restore());
    }
    return _results;
  };
  draw_finger_positions = function() {
    var default_options, position, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      position = positions[_i];
      default_options = {
        color: style.interval_class_colors[position.interval_class],
        is_root: position.interval_class === 0
      };
      _results.push(draw_finger_position(position, _.extend(default_options, position)));
    }
    return _results;
  };
  draw_closed_strings = function() {
    var closed_strings, fretted_strings, position, r, x, y, _i, _j, _len, _len1, _ref1, _results;
    fretted_strings = [];
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      position = positions[_i];
      fretted_strings[position.string] = true;
    }
    closed_strings = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = StringNumbers.length; _j < _len1; _j++) {
        string = StringNumbers[_j];
        if (!fretted_strings[string]) {
          _results.push(string);
        }
      }
      return _results;
    })();
    r = style.note_radius;
    ctx.fillStyle = 'black';
    _results = [];
    for (_j = 0, _len1 = closed_strings.length; _j < _len1; _j++) {
      string = closed_strings[_j];
      _ref1 = finger_coordinates({
        string: string,
        fret: 0
      }), x = _ref1.x, y = _ref1.y;
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(x - r, y - r);
      ctx.lineTo(x + r, y + r);
      ctx.moveTo(x - r, y + r);
      ctx.lineTo(x + r, y - r);
      _results.push(ctx.stroke());
    }
    return _results;
  };
  draw_chord_diagram_strings(ctx, options);
  draw_chord_diagram_frets(ctx, {
    nut: options.nut
  });
  if (barres) {
    draw_barres();
  }
  if (positions) {
    draw_finger_positions();
  }
  if (positions && options.draw_closed_strings) {
    return draw_closed_strings();
  }
};

draw_chord_block = function(positions, options) {
  var dimensions;
  dimensions = compute_dimensions();
  return Layout.block({
    width: dimensions.width,
    height: dimensions.height,
    draw: function() {
      return Layout.with_graphics_context(function(ctx) {
        ctx.translate(0, -dimensions.height);
        return draw_chord_diagram(ctx, positions, options);
      });
    }
  });
};

module.exports = {
  defaultStyle: DefaultStyle,
  width: compute_dimensions().width,
  height: compute_dimensions().height,
  draw: draw_chord_diagram,
  block: draw_chord_block
};


},{"./fretboard_model":"dVmYil","./layout":"ThjNWR","./utils":"VD5hCQ","underscore":25}],"JjUvl1":[function(require,module,exports){
var DefaultStyle, FretCount, FretNumbers, StringCount, StringNumbers, draw_fretboard, draw_fretboard_finger_position, draw_fretboard_frets, draw_fretboard_strings, padded_fretboard_height, padded_fretboard_width, _ref;

_ref = require('./fretboard_model'), FretCount = _ref.FretCount, FretNumbers = _ref.FretNumbers, StringCount = _ref.StringCount, StringNumbers = _ref.StringNumbers;

DefaultStyle = {
  h_gutter: 10,
  v_gutter: 10,
  string_spacing: 20,
  fret_width: 45,
  fret_overhang: .3 * 45
};

padded_fretboard_width = (function(style) {
  return 2 * style.v_gutter + style.fret_width * FretCount + style.fret_overhang;
})(DefaultStyle);

padded_fretboard_height = (function(style) {
  return 2 * style.h_gutter + (StringCount - 1) * style.string_spacing;
})(DefaultStyle);

draw_fretboard_strings = function(ctx) {
  var string, style, y, _i, _len, _results;
  style = DefaultStyle;
  _results = [];
  for (_i = 0, _len = StringNumbers.length; _i < _len; _i++) {
    string = StringNumbers[_i];
    y = string * style.string_spacing + style.h_gutter;
    ctx.beginPath();
    ctx.moveTo(style.h_gutter, y);
    ctx.lineTo(style.h_gutter + FretCount * style.fret_width + style.fret_overhang, y);
    ctx.lineWidth = 1;
    _results.push(ctx.stroke());
  }
  return _results;
};

draw_fretboard_frets = function(ctx) {
  var fret, style, x, _i, _len, _results;
  style = DefaultStyle;
  _results = [];
  for (_i = 0, _len = FretNumbers.length; _i < _len; _i++) {
    fret = FretNumbers[_i];
    x = style.h_gutter + fret * style.fret_width;
    ctx.beginPath();
    ctx.moveTo(x, style.h_gutter);
    ctx.lineTo(x, style.h_gutter + (StringCount - 1) * style.string_spacing);
    if (fret === 0) {
      ctx.lineWidth = 3;
    }
    ctx.stroke();
    _results.push(ctx.lineWidth = 1);
  }
  return _results;
};

draw_fretboard_finger_position = function(ctx, position, options) {
  var color, fret, is_root, string, style, x, y;
  if (options == null) {
    options = {};
  }
  string = position.string, fret = position.fret;
  is_root = options.is_root, color = options.color;
  style = DefaultStyle;
  color || (color = is_root ? 'red' : 'white');
  x = style.h_gutter + (fret - 0.5) * style.fret_width;
  if (fret === 0) {
    x = style.h_gutter;
  }
  y = style.v_gutter + (5 - string) * style.string_spacing;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  if (!is_root) {
    ctx.lineWidth = 2;
  }
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'black';
  return ctx.lineWidth = 1;
};

draw_fretboard = function(ctx, positions) {
  var position, _i, _len, _ref1, _results;
  draw_fretboard_strings(ctx);
  draw_fretboard_frets(ctx);
  _ref1 = positions || [];
  _results = [];
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    position = _ref1[_i];
    _results.push(draw_fretboard_finger_position(ctx, position, position));
  }
  return _results;
};

module.exports = {
  draw: draw_fretboard,
  height: padded_fretboard_height,
  width: padded_fretboard_width
};


},{"./fretboard_model":"dVmYil"}],"YoMTGX":[function(require,module,exports){
var Fingering, FretNumbers, FretboardModel, OpenStringPitches, StringNumbers, best_fingering_for, find_barre_sets, find_barres, finger_positions_on_chord, fingerings_for, fretboard_positions_each, interval_class_between, pitch_number_for_position, util, _,
  __slice = [].slice;

util = require('util');

_ = require('underscore');

interval_class_between = require('./theory').interval_class_between;

FretboardModel = require('./fretboard_model');

FretNumbers = FretboardModel.FretNumbers, OpenStringPitches = FretboardModel.OpenStringPitches, StringNumbers = FretboardModel.StringNumbers, fretboard_positions_each = FretboardModel.fretboard_positions_each, pitch_number_for_position = FretboardModel.pitch_number_for_position;

require('./utils');

Fingering = (function() {
  function Fingering(_arg) {
    this.positions = _arg.positions, this.chord = _arg.chord, this.barres = _arg.barres;
    this.positions.sort(function(a, b) {
      return a.string - b.string;
    });
  }

  Fingering.cached_getter('fretstring', function() {
    var fret, fret_vector, s, string, x, _i, _len, _ref, _ref1;
    fret_vector = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = StringNumbers.length; _i < _len; _i++) {
        s = StringNumbers[_i];
        _results.push(-1);
      }
      return _results;
    })();
    _ref = this.positions;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref1 = _ref[_i], string = _ref1.string, fret = _ref1.fret;
      fret_vector[string] = fret;
    }
    return ((function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = fret_vector.length; _j < _len1; _j++) {
        x = fret_vector[_j];
        _results.push(x >= 0 ? x : 'x');
      }
      return _results;
    })()).join('');
  });

  Fingering.cached_getter('inversion', function() {
    return this.chord.pitch_classes.indexOf(interval_class_between(this.chord.root, pitch_number_for_position(this.positions[0])));
  });

  return Fingering;

})();

find_barres = function(positions) {
  var barres, fn, fp, fret_rows, m, sn, _i, _len;
  fret_rows = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = FretNumbers.length; _i < _len; _i++) {
      fn = FretNumbers[_i];
      _results.push(((function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (_j = 0, _len1 = StringNumbers.length; _j < _len1; _j++) {
          sn = StringNumbers[_j];
          if (_.find(positions, function(pos) {
            return pos.string === sn && pos.fret > fn;
          })) {
            _results1.push('.');
          } else if (_.find(positions, function(pos) {
            return pos.string === sn && pos.fret < fn;
          })) {
            _results1.push('-');
          } else if (_.find(positions, function(pos) {
            return pos.string === sn && pos.fret === fn;
          })) {
            _results1.push('x');
          } else {
            _results1.push(' ');
          }
        }
        return _results1;
      })()).join(''));
    }
    return _results;
  })();
  barres = [];
  for (fn = _i = 0, _len = fret_rows.length; _i < _len; fn = ++_i) {
    fp = fret_rows[fn];
    if (fn === 0) {
      continue;
    }
    m = fp.match(/^[^x]*(x[\.x]+x\.*)$/);
    if (!m) {
      continue;
    }
    barres.push({
      fret: fn,
      string: m[0].length - m[1].length,
      string_count: m[1].length,
      subsumption_count: m[1].match(/x/g).length
    });
  }
  return barres;
};

find_barre_sets = function(positions) {
  var barres, powerset;
  powerset = function(xs) {
    var tail, x, ys, _ref;
    if (!xs.length) {
      return [[]];
    }
    _ref = xs, x = _ref[0], xs = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
    tail = powerset(xs);
    return tail.concat((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = tail.length; _i < _len; _i++) {
        ys = tail[_i];
        _results.push([x].concat(ys));
      }
      return _results;
    })());
  };
  barres = find_barres(positions);
  return powerset(barres);
};

finger_positions_on_chord = function(chord) {
  var positions;
  positions = [];
  fretboard_positions_each(function(pos) {
    var degree_index, interval_class;
    interval_class = interval_class_between(chord.root, pitch_number_for_position(pos));
    degree_index = chord.pitch_classes.indexOf(interval_class);
    if (degree_index >= 0) {
      return positions.push({
        string: pos.string,
        fret: pos.fret,
        interval_class: interval_class,
        degree_index: degree_index
      });
    }
  });
  return positions;
};

fingerings_for = function(chord, options) {
  var chord_name, chord_note_count, cmp, collect_fingering_positions, count_distinct_notes, filter_fingerings, filters, finger_count, fingerings, four_fingers_or_fewer, frets_per_string, generate_fingerings, has_all_notes, high_note_count, is_root_position, muted_medial_strings, muted_treble_strings, positions, preferences, reverse_sort_key, sort_fingerings, warn, __;
  if (options == null) {
    options = {};
  }
  options = _.extend({
    filter: true
  }, options);
  warn = false;
  if (chord.root == null) {
    throw new Error("No root for " + (util.inspect(chord)));
  }
  positions = finger_positions_on_chord(chord);
  frets_per_string = (function(strings) {
    var position, _i, _len;
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      position = positions[_i];
      strings[position.string].push(position);
    }
    return strings;
  })((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = OpenStringPitches.length; _i < _len; _i++) {
      __ = OpenStringPitches[_i];
      _results.push([]);
    }
    return _results;
  })());
  collect_fingering_positions = function(string_frets) {
    var following_finger_positions, frets, n, right;
    if (!string_frets.length) {
      return [[]];
    }
    frets = string_frets[0];
    following_finger_positions = collect_fingering_positions(string_frets.slice(1));
    return following_finger_positions.concat.apply(following_finger_positions, (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = following_finger_positions.length; _i < _len; _i++) {
        right = following_finger_positions[_i];
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = frets.length; _j < _len1; _j++) {
            n = frets[_j];
            _results1.push([n].concat(right));
          }
          return _results1;
        })());
      }
      return _results;
    })());
  };
  generate_fingerings = function() {
    var barres;
    return _.flatten((function() {
      var _i, _len, _ref, _results;
      _ref = collect_fingering_positions(frets_per_string);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        positions = _ref[_i];
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = find_barre_sets(positions);
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            barres = _ref1[_j];
            _results1.push(new Fingering({
              positions: positions,
              chord: chord,
              barres: barres
            }));
          }
          return _results1;
        })());
      }
      return _results;
    })());
  };
  chord_note_count = chord.pitch_classes.length;
  count_distinct_notes = function(fingering) {
    return _.chain(fingering.positions).pluck('interval_class').uniq().value().length;
  };
  has_all_notes = function(fingering) {
    return count_distinct_notes(fingering) === chord_note_count;
  };
  muted_medial_strings = function(fingering) {
    return fingering.fretstring.match(/\dx+\d/);
  };
  muted_treble_strings = function(fingering) {
    return fingering.fretstring.match(/x$/);
  };
  finger_count = function(fingering) {
    var barre, n, pos, _i, _len, _ref;
    n = ((function() {
      var _i, _len, _ref, _results;
      _ref = fingering.positions;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pos = _ref[_i];
        if (pos.fret > 0) {
          _results.push(pos);
        }
      }
      return _results;
    })()).length;
    _ref = fingering.barres;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      barre = _ref[_i];
      n -= barre.subsumption_count;
    }
    return n;
  };
  four_fingers_or_fewer = function(fingering) {
    return finger_count(fingering) <= 4;
  };
  cmp = function(fn) {
    return function() {
      var x;
      x = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return !fn.apply(null, x);
    };
  };
  filters = [];
  filters.push({
    name: 'has all chord notes',
    select: has_all_notes
  });
  if (options.filter) {
    filters.push({
      name: 'four fingers or fewer',
      select: four_fingers_or_fewer
    });
  }
  if (!options.fingerpicking) {
    filters.push({
      name: 'no muted medial strings',
      reject: muted_medial_strings
    });
    filters.push({
      name: 'no muted treble strings',
      reject: muted_treble_strings
    });
  }
  filter_fingerings = function(fingerings) {
    var filtered, fingering, name, reject, select, _i, _len, _ref;
    for (_i = 0, _len = filters.length; _i < _len; _i++) {
      _ref = filters[_i], name = _ref.name, select = _ref.select, reject = _ref.reject;
      select || (select = cmp(reject));
      filtered = (function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = fingerings.length; _j < _len1; _j++) {
          fingering = fingerings[_j];
          if (select(fingering)) {
            _results.push(fingering);
          }
        }
        return _results;
      })();
      if (!filtered.length) {
        if (warn) {
          console.warn("" + chord_name + ": no fingerings pass filter \"" + name + "\"");
        }
        filtered = fingerings;
      }
      fingerings = filtered;
    }
    return fingerings;
  };
  high_note_count = function(fingering) {
    return fingering.positions.length;
  };
  is_root_position = function(fingering) {
    return _(fingering.positions).sortBy(function(pos) {
      return pos.string;
    })[0].degree_index === 0;
  };
  reverse_sort_key = function(fn) {
    return function(a) {
      return -fn(a);
    };
  };
  preferences = [
    {
      name: 'root position',
      key: is_root_position
    }, {
      name: 'high note count',
      key: high_note_count
    }, {
      name: 'avoid barres',
      key: reverse_sort_key(function(fingering) {
        return fingering.barres.length;
      })
    }, {
      name: 'low finger count',
      key: reverse_sort_key(finger_count)
    }
  ];
  sort_fingerings = function(fingerings) {
    var key, _i, _len, _ref;
    _ref = preferences.slice(0).reverse();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i].key;
      fingerings = _(fingerings).sortBy(key);
    }
    fingerings.reverse();
    return fingerings;
  };
  chord_name = chord.name;
  fingerings = generate_fingerings();
  fingerings = filter_fingerings(fingerings);
  fingerings = sort_fingerings(fingerings);
  return fingerings;
};

best_fingering_for = function(chord) {
  return fingerings_for(chord)[0];
};

module.exports = {
  best_fingering_for: best_fingering_for,
  fingerings_for: fingerings_for,
  finger_positions_on_chord: finger_positions_on_chord
};


},{"./fretboard_model":"dVmYil","./theory":"AmyBcu","./utils":"VD5hCQ","underscore":25,"util":20}],"dVmYil":[function(require,module,exports){
var FretCount, FretNumbers, OpenStringPitches, StringCount, StringIntervals, StringNumbers, fretboard_positions_each, interval_class_between, intervals_from, pitch_number_for_position;

interval_class_between = require('./theory').interval_class_between;

StringNumbers = [0, 1, 2, 3, 4, 5];

StringCount = StringNumbers.length;

FretNumbers = [0, 1, 2, 3, 4];

FretCount = FretNumbers.length - 1;

StringIntervals = [5, 5, 5, 4, 5];

OpenStringPitches = (function(numbers) {
  var i, interval, _i, _len;
  numbers.push(20);
  for (i = _i = 0, _len = StringIntervals.length; _i < _len; i = ++_i) {
    interval = StringIntervals[i];
    numbers.push(numbers[i] + interval);
  }
  return numbers;
})([]);

pitch_number_for_position = function(_arg) {
  var fret, string;
  string = _arg.string, fret = _arg.fret;
  return OpenStringPitches[string] + fret;
};

fretboard_positions_each = function(fn) {
  var fret, string, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = StringNumbers.length; _i < _len; _i++) {
    string = StringNumbers[_i];
    _results.push((function() {
      var _j, _len1, _results1;
      _results1 = [];
      for (_j = 0, _len1 = FretNumbers.length; _j < _len1; _j++) {
        fret = FretNumbers[_j];
        _results1.push(fn({
          string: string,
          fret: fret
        }));
      }
      return _results1;
    })());
  }
  return _results;
};

intervals_from = function(root_position, semitones) {
  var positions, root_note_number;
  root_note_number = pitch_number_for_position(root_position);
  positions = [];
  fretboard_positions_each(function(finger_position) {
    if (interval_class_between(root_note_number, pitch_number_for_position(finger_position)) !== semitones) {
      return;
    }
    return positions.push(finger_position);
  });
  return positions;
};

module.exports = {
  StringNumbers: StringNumbers,
  StringCount: StringCount,
  FretNumbers: FretNumbers,
  FretCount: FretCount,
  OpenStringPitches: OpenStringPitches,
  fretboard_positions_each: fretboard_positions_each,
  pitch_number_for_position: pitch_number_for_position,
  intervals_from: intervals_from
};


},{"./theory":"AmyBcu"}],"L0flg7":[function(require,module,exports){
var ChordDiagram, DefaultStyle, IntervalNames, IntervalVectors, block, draw_harmonic_table, draw_text, harmonic_table_block, interval_class_vectors, with_alignment, with_graphics_context, _, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

IntervalNames = require('./theory').IntervalNames;

_ref = require('./layout'), block = _ref.block, draw_text = _ref.draw_text, with_graphics_context = _ref.with_graphics_context, with_alignment = _ref.with_alignment;

ChordDiagram = require('./chord_diagram');

DefaultStyle = {
  interval_class_colors: ChordDiagram.defaultStyle.interval_class_colors,
  radius: 50,
  center: true,
  fill_cells: false,
  label_cells: false
};

IntervalVectors = {
  2: {
    P5: -1,
    m3: -1
  },
  3: {
    m3: 1
  },
  4: {
    M3: 1
  },
  5: {
    P5: -1
  },
  6: {
    m3: 2
  },
  11: {
    P5: 1,
    M3: 1
  }
};

interval_class_vectors = function(interval_class) {
  var adjust, adjustments, computed_semitones, intervals, k, original_interval_class, record, sign, v, _ref1, _ref2;
  original_interval_class = interval_class;
  adjustments = {};
  adjust = function(d_ic, intervals) {
    var k, v, _results;
    interval_class += d_ic;
    for (k in intervals) {
      if (adjustments[k] == null) {
        adjustments[k] = 0;
      }
    }
    _results = [];
    for (k in intervals) {
      v = intervals[k];
      _results.push(adjustments[k] += v);
    }
    return _results;
  };
  while (interval_class >= 24) {
    adjust(-24, {
      P5: 4,
      M3: -1
    });
  }
  while (interval_class >= 12) {
    adjust(-12, {
      M3: 3
    });
  }
  _ref1 = [IntervalVectors[interval_class], 1], record = _ref1[0], sign = _ref1[1];
  if (!record) {
    _ref2 = [IntervalVectors[12 - interval_class], -1], record = _ref2[0], sign = _ref2[1];
  }
  intervals = _.extend({
    m3: 0,
    M3: 0,
    P5: 0,
    sign: 1
  }, record);
  for (k in intervals) {
    intervals[k] *= sign;
  }
  for (k in adjustments) {
    v = adjustments[k];
    intervals[k] += v;
  }
  computed_semitones = (12 + intervals.P5 * 7 + intervals.M3 * 4 + intervals.m3 * 3) % 12;
  if (computed_semitones !== original_interval_class % 12) {
    console.error("Error computing grid position for " + original_interval_class + ":\n", "  " + original_interval_class + " ->", intervals, '->', computed_semitones, '!=', original_interval_class % 12);
  }
  return intervals;
};

draw_harmonic_table = function(interval_classes, options) {
  var bounds, cell_center, cell_radius, colors, hex_radius, interval_klass, x, y, _i, _len, _ref1;
  if (options == null) {
    options = {};
  }
  options = _.extend({
    draw: true
  }, DefaultStyle, options);
  colors = options.interval_class_colors;
  if (__indexOf.call(interval_classes, 0) < 0) {
    interval_classes = [0].concat(interval_classes);
  }
  cell_radius = options.radius;
  hex_radius = cell_radius / 2;
  cell_center = function(interval_klass) {
    var dx, dy, vectors, x, y;
    vectors = interval_class_vectors(interval_klass);
    dy = vectors.P5 + (vectors.M3 + vectors.m3) / 2;
    dx = vectors.M3 - vectors.m3;
    x = dx * cell_radius * .8;
    y = -dy * cell_radius * .95;
    return {
      x: x,
      y: y
    };
  };
  bounds = {
    left: Infinity,
    top: Infinity,
    right: -Infinity,
    bottom: -Infinity
  };
  for (_i = 0, _len = interval_classes.length; _i < _len; _i++) {
    interval_klass = interval_classes[_i];
    _ref1 = cell_center(interval_klass), x = _ref1.x, y = _ref1.y;
    bounds.left = Math.min(bounds.left, x - hex_radius);
    bounds.top = Math.min(bounds.top, y - hex_radius);
    bounds.right = Math.max(bounds.right, x + hex_radius);
    bounds.bottom = Math.max(bounds.bottom, y + hex_radius);
  }
  if (!options.draw) {
    return {
      width: bounds.right - bounds.left,
      height: bounds.bottom - bounds.top
    };
  }
  return with_graphics_context(function(ctx) {
    var a, color, i, is_root, label, pos, _fn, _j, _k, _l, _len1, _len2, _ref2, _ref3, _results;
    ctx.translate(-bounds.left, -bounds.bottom);
    _fn = function() {
      var dn, dx, dy, _ref2;
      _ref2 = [-y, x, 2 / Math.sqrt(x * x + y * y)], dx = _ref2[0], dy = _ref2[1], dn = _ref2[2];
      dx *= dn;
      dy *= dn;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x + dx, y + dy);
      ctx.lineTo(x - dx, y - dy);
      ctx.fillStyle = color;
      return ctx.fill();
    };
    for (_j = 0, _len1 = interval_classes.length; _j < _len1; _j++) {
      interval_klass = interval_classes[_j];
      is_root = interval_klass === 0;
      color = colors[interval_klass % 12];
      color || (color = colors[12 - interval_klass]);
      ctx.beginPath();
      _ref2 = cell_center(interval_klass), x = _ref2.x, y = _ref2.y;
      for (i = _k = 0; _k <= 6; i = ++_k) {
        a = i * Math.PI / 3;
        pos = [x + hex_radius * Math.cos(a), y + hex_radius * Math.sin(a)];
        if (i === 0) {
          ctx.moveTo.apply(ctx, pos);
        }
        ctx.lineTo.apply(ctx, pos);
      }
      ctx.strokeStyle = 'gray';
      ctx.stroke();
      if (is_root || (options.fill_cells && interval_klass < 12)) {
        ctx.fillStyle = color || 'rgba(255,0,0,0.15)';
        if (!is_root) {
          ctx.globalAlpha = 0.3;
        }
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      if (is_root || options.fill_cells) {
        continue;
      }
      if (options.label_cells) {
        ctx.globalAlpha = 0.3;
      }
      _fn();
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'red';
    ctx.fill();
    if (options.label_cells) {
      _results = [];
      for (_l = 0, _len2 = interval_classes.length; _l < _len2; _l++) {
        interval_klass = interval_classes[_l];
        label = IntervalNames[interval_klass];
        if (interval_klass === 0) {
          label = 'R';
        }
        _ref3 = cell_center(interval_klass), x = _ref3.x, y = _ref3.y;
        _results.push(draw_text(label, {
          font: '10pt Times',
          fillStyle: 'black',
          x: x,
          y: y,
          gravity: 'center'
        }));
      }
      return _results;
    }
  });
};

harmonic_table_block = function(tones, options) {
  var dimensions;
  dimensions = draw_harmonic_table(tones, _.extend({}, options, {
    compute_bounds: true,
    draw: false
  }));
  return block({
    width: dimensions.width,
    height: dimensions.height,
    draw: function() {
      return draw_harmonic_table(tones, options);
    }
  });
};

module.exports = {
  draw: draw_harmonic_table,
  block: harmonic_table_block
};


},{"./chord_diagram":"kgIvBT","./layout":"ThjNWR","./theory":"AmyBcu","underscore":25}],"ThjNWR":[function(require,module,exports){
var BuildDirectory, Canvas, Context, CurrentBook, CurrentPage, DefaultFilename, Mode, PaperSizes, TDLRLayout, above, box, directory, draw_text, erase_background, filename, fs, get_page_size_dimensions, hbox, labeled, measure_text, overlay, pad_box, path, save_canvas_to_png, text_box, util, vbox, with_book, with_canvas, with_graphics_context, with_grid, with_grid_boxes, with_page, write_pdf, _,
  __slice = [].slice;

fs = require('fs');

path = require('path');

util = require('util');

_ = require('underscore');

Canvas = require('canvas');

Context = {
  canvas: null,
  ctx: null
};

erase_background = function() {
  var canvas, ctx;
  canvas = Context.canvas, ctx = Context.ctx;
  ctx.fillStyle = 'white';
  return ctx.fillRect(0, 0, canvas.width, canvas.height);
};

measure_text = function(text, _arg) {
  var ctx, font;
  font = (_arg != null ? _arg : {}).font;
  ctx = Context.ctx;
  if (font) {
    ctx.font = font;
  }
  return ctx.measureText(text);
};

draw_text = function(text, options) {
  var choice, ctx, fillStyle, font, gravity, m, width, x, y, _i, _len, _ref;
  if (options == null) {
    options = {};
  }
  ctx = Context.ctx;
  if (_.isObject(text)) {
    options = text;
  }
  font = options.font, fillStyle = options.fillStyle, x = options.x, y = options.y, gravity = options.gravity, width = options.width;
  gravity || (gravity = '');
  if (options.choices) {
    _ref = options.choices;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      choice = _ref[_i];
      if (_.isString(choice)) {
        text = choice;
      }
      if (_.isObject(choice)) {
        font = choice.font;
      }
      if (measure_text(text, {
        font: font
      }).width <= options.width) {
        break;
      }
    }
  }
  if (font) {
    ctx.font = font;
  }
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
  }
  m = ctx.measureText(text);
  x || (x = 0);
  y || (y = 0);
  if (gravity.match(/^(top|center|middle|centerbottom)$/i)) {
    x -= m.width / 2;
  }
  if (gravity.match(/^(right|topRight|botRight)$/i)) {
    x -= m.width;
  }
  if (gravity.match(/^(bottom|botLeft|botRight)$/i)) {
    y -= m.emHeightDescent;
  }
  if (gravity.match(/^(top|topLeft|topRight)$/i)) {
    y += m.emHeightAscent;
  }
  return ctx.fillText(text, x, y);
};

with_canvas = function(canvas, cb) {
  var savedCanvas, savedContext;
  savedCanvas = Context.canvas;
  savedContext = Context.context;
  try {
    Context.canvas = canvas;
    Context.ctx = canvas.getContext('2d');
    return cb();
  } finally {
    Context.canvas = savedCanvas;
    Context.context = savedContext;
  }
};

with_graphics_context = function(fn) {
  var ctx;
  ctx = Context.ctx;
  ctx.save();
  try {
    return fn(ctx);
  } finally {
    ctx.restore();
  }
};

box = function(params) {
  var _ref, _ref1, _ref2;
  box = _.extend({
    width: 0
  }, params);
  if (box.height == null) {
    box.height = ((_ref = box.ascent) != null ? _ref : 0) + ((_ref1 = box.descent) != null ? _ref1 : 0);
  }
  if (box.ascent == null) {
    box.ascent = box.height - ((_ref2 = box.descent) != null ? _ref2 : 0);
  }
  if (box.descent == null) {
    box.descent = box.height - box.ascent;
  }
  return box;
};

pad_box = function(box, options) {
  var _ref;
  if (options.bottom) {
    box.height += options.bottom;
  }
  if (options.bottom) {
    box.descent = ((_ref = box.descent) != null ? _ref : 0) + options.bottom;
  }
  return box;
};

text_box = function(text, options) {
  var measure;
  options = _.extend({}, options, {
    gravity: false
  });
  measure = measure_text(text, options);
  return box({
    width: measure.width,
    height: measure.emHeightAscent + measure.emHeightDescent,
    descent: measure.emHeightDescent,
    draw: function() {
      return draw_text(text, options);
    }
  });
};

vbox = function() {
  var boxes, boxes_below, descent, height, options, width;
  boxes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  options = {};
  if (boxes[boxes.length - 1].width == null) {
    options = boxes.pop();
  }
  options = _.extend({
    align: 'left'
  }, options);
  width = Math.max.apply(Math, _.pluck(boxes, 'width'));
  height = _.pluck(boxes, 'height').reduce(function(a, b) {
    return a + b;
  });
  descent = boxes[boxes.length - 1].descent;
  if (options.baseline) {
    boxes_below = boxes.slice(boxes.indexOf(options.baseline) + 1);
    descent = options.baseline.descent + _.pluck(boxes_below, 'height').reduce((function(a, b) {
      return a + b;
    }), 0);
  }
  return box({
    width: width,
    height: height,
    descent: descent,
    draw: function() {
      var dy;
      dy = -height;
      return boxes.forEach(function(b1) {
        return with_graphics_context(function(ctx) {
          var dx;
          dx = (function() {
            switch (options.align) {
              case 'left':
                return 0;
              case 'center':
                return Math.max(0, (width - b1.width) / 2);
            }
          })();
          ctx.translate(dx, dy + b1.height - b1.descent);
          if (typeof b1.draw === "function") {
            b1.draw(ctx);
          }
          return dy += b1.height;
        });
      });
    }
  });
};

above = vbox;

hbox = function(b1, b2) {
  var b, boxes, container_size, height, spring_count, width;
  container_size = (typeof CurrentBook !== "undefined" && CurrentBook !== null ? CurrentBook.page_options : void 0) || CurrentPage;
  boxes = [b1, b2];
  height = Math.max.apply(Math, _.pluck(boxes, 'height'));
  width = _.pluck(boxes, 'width').reduce(function(a, b) {
    return a + b;
  });
  if (width === Infinity) {
    width = container_size.width;
  }
  spring_count = ((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = boxes.length; _i < _len; _i++) {
      b = boxes[_i];
      if (b.width === Infinity) {
        _results.push(b);
      }
    }
    return _results;
  })()).length;
  return box({
    width: width,
    height: height,
    draw: function() {
      var x;
      x = 0;
      return boxes.forEach(function(b) {
        with_graphics_context(function(ctx) {
          ctx.translate(x, 0);
          return typeof b.draw === "function" ? b.draw(ctx) : void 0;
        });
        if (b.width === Infinity) {
          return x += (width - ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = boxes.length; _i < _len; _i++) {
              width = boxes[_i].width;
              if (width !== Infinity) {
                _results.push(width);
              }
            }
            return _results;
          })()).reduce(function(a, b) {
            return a + b;
          })) / spring_count;
        } else {
          return x += b.width;
        }
      });
    }
  });
};

overlay = function() {
  var boxes;
  boxes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return box({
    width: Math.max.apply(Math, _.pluck(boxes, 'width')),
    height: Math.max.apply(Math, _.pluck(boxes, 'height')),
    draw: function() {
      var b, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = boxes.length; _i < _len; _i++) {
        b = boxes[_i];
        _results.push(with_graphics_context(function(ctx) {
          return b.draw(ctx);
        }));
      }
      return _results;
    }
  });
};

labeled = function(text, options, box) {
  var default_options, _ref;
  if (arguments.length === 2) {
    _ref = [{}, options], options = _ref[0], box = _ref[1];
  }
  default_options = {
    font: '12px Times',
    fillStyle: 'black'
  };
  options = _.extend(default_options, options);
  return above(text_box(text, options), box, options);
};

with_grid_boxes = function(options, generator) {
  var cell, cell_height, cell_width, cells, container_size, floor, header, line_break, max, max_descent, _i, _len;
  max = Math.max, floor = Math.floor;
  options = _.extend({
    header_height: 0,
    gutter_width: 10,
    gutter_height: 10
  }, options);
  container_size = (typeof CurrentBook !== "undefined" && CurrentBook !== null ? CurrentBook.page_options : void 0) || CurrentPage;
  line_break = {
    width: 0,
    height: 0,
    linebreak: true
  };
  header = null;
  cells = [];
  generator({
    header: function(box) {
      return header = box;
    },
    start_row: function() {
      return cells.push(line_break);
    },
    cell: function(box) {
      return cells.push(box);
    },
    cells: function(boxes) {
      var b, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = boxes.length; _i < _len; _i++) {
        b = boxes[_i];
        _results.push(cells.push(b));
      }
      return _results;
    }
  });
  cell_width = max.apply(null, _.pluck(cells, 'width'));
  cell_height = max.apply(null, _.pluck(cells, 'height'));
  _.extend(options, {
    header_height: (header != null ? header.height : void 0) || 0,
    cell_width: cell_width,
    cell_height: cell_height,
    cols: max(1, floor((container_size.width + options.gutter_width) / (cell_width + options.gutter_width)))
  });
  options.rows = (function() {
    var content_height;
    content_height = container_size.height - options.header_height;
    cell_height = cell_height + options.gutter_height;
    return max(1, floor((content_height + options.gutter_height) / cell_height));
  })();
  for (_i = 0, _len = cells.length; _i < _len; _i++) {
    cell = cells[_i];
    if (cell.descent == null) {
      cell.descent = 0;
    }
  }
  max_descent = max.apply(null, _.pluck(cells, 'descent'));
  return with_grid(options, function(grid) {
    if (header) {
      with_graphics_context(function(ctx) {
        ctx.translate(0, header.height - header.descent);
        return header != null ? header.draw(ctx) : void 0;
      });
    }
    return cells.forEach(function(cell) {
      if (cell.linebreak != null) {
        grid.start_row();
      }
      if (cell === line_break) {
        return;
      }
      return grid.add_cell(function() {
        return with_graphics_context(function(ctx) {
          ctx.translate(0, cell_height - cell.descent);
          return cell.draw(ctx);
        });
      });
    });
  });
};

BuildDirectory = '.';

DefaultFilename = null;

directory = function(path) {
  return BuildDirectory = path;
};

filename = function(name) {
  return DefaultFilename = name;
};

save_canvas_to_png = function(canvas, fname) {
  var out, stream;
  out = fs.createWriteStream(path.join(BuildDirectory, fname));
  stream = canvas.pngStream();
  stream.on('data', function(chunk) {
    return out.write(chunk);
  });
  return stream.on('end', function() {
    return console.info("Saved " + fname);
  });
};

PaperSizes = {
  folio: '12in x 15in',
  quarto: '9.5in x 12in',
  octavo: '6in x 9in',
  duodecimo: '5in x 7.375in',
  'ANSI A': '8.5in × 11in',
  'ANSI B': '11in x 17in',
  letter: 'ANSI A',
  ledger: 'ANSI B landscape',
  tabloid: 'ANSI B portrait',
  'ANSI C': '17in × 22in',
  'ANSI D': '22in × 34in',
  'ANSI E': '34in × 44in'
};

get_page_size_dimensions = function(size, orientation) {
  var height, parseMeasure, width, _ref, _ref1, _ref2, _ref3, _ref4;
  if (orientation == null) {
    orientation = null;
  }
  parseMeasure = function(measure) {
    var n, units, _ref;
    if (typeof measure === 'number') {
      return measure;
    }
    if (!measure.match(/^(\d+(?:\.\d*)?)\s*(.+)$/)) {
      throw new Error("Unrecognized measure " + (util.inspect(measure)) + " in " + (util.inspect(size)));
    }
    _ref = [Number(RegExp.$1), RegExp.$2], n = _ref[0], units = _ref[1];
    switch (units) {
      case "":
        return n;
      case "in":
        return n * 72;
      default:
        throw new Error("Unrecognized units " + (util.inspect(units)) + " in " + (util.inspect(size)));
    }
  };
  width = size.width, height = size.height;
  while (_.isString(size)) {
    if (size.match(/^(.+)\s+(landscape|portrait)$/)) {
      _ref = [RegExp.$1, RegExp.R2], size = _ref[0], orientation = _ref[1];
    }
    if (!(size in PaperSizes)) {
      break;
    }
    size = PaperSizes[size];
    width = size.width, height = size.height;
  }
  if (_.isString(size)) {
    if (!size.match(/^(.+?)\s*[x×]\s*(.+)$/)) {
      throw new Error("Unrecognized book size format " + (util.inspect(size)));
    }
    _ref1 = [RegExp.$1, RegExp.$2], width = _ref1[0], height = _ref1[1];
  }
  _ref2 = [parseMeasure(width), parseMeasure(height)], width = _ref2[0], height = _ref2[1];
  switch (orientation || '') {
    case 'landscape':
      if (!(width > height)) {
        _ref3 = [height, width], width = _ref3[0], height = _ref3[1];
      }
      break;
    case 'portrait':
      if (width > height) {
        _ref4 = [height, width], width = _ref4[0], height = _ref4[1];
      }
      break;
    case '':
      null;
      break;
    default:
      throw new Error("Unknown orientation " + (util.inspect(orientation)));
  }
  return {
    width: width,
    height: height
  };
};

(function() {
  var name, value, _results;
  _results = [];
  for (name in PaperSizes) {
    value = PaperSizes[name];
    _results.push(PaperSizes[name] = get_page_size_dimensions(value));
  }
  return _results;
})();

CurrentPage = null;

CurrentBook = null;

Mode = null;

_.mixin({
  sum: (function(plus) {
    return function(xs) {
      return _.reduce(xs, plus, 0);
    };
  })(function(a, b) {
    return a + b;
  })
});

TDLRLayout = function(boxes) {
  var ascent, b, descent, dx, dy, line, page_width, width, _i, _j, _len, _len1, _results;
  page_width = CurrentPage.width - CurrentPage.left_margin - CurrentPage.top_margin;
  boxes = boxes.slice(0);
  for (_i = 0, _len = boxes.length; _i < _len; _i++) {
    b = boxes[_i];
    if (b.descent == null) {
      b.descent = 0;
    }
  }
  dy = 0;
  width = 0;
  _results = [];
  while (boxes.length) {
    console.info('next', boxes.length);
    line = [];
    while (boxes.length) {
      b = boxes[0];
      if (width + b.width > page_width && line.length > 0) {
        break;
      }
      line.push(b);
      boxes.shift();
      width += b.width;
    }
    ascent = _.max((function() {
      var _j, _len1, _results1;
      _results1 = [];
      for (_j = 0, _len1 = line.length; _j < _len1; _j++) {
        b = line[_j];
        _results1.push(b.height - b.descent);
      }
      return _results1;
    })());
    descent = _.chain(line).pluck('descent').max();
    dx = 0;
    console.info('draw', line.length);
    for (_j = 0, _len1 = line.length; _j < _len1; _j++) {
      b = line[_j];
      with_graphics_context(function(ctx) {
        ctx.translate(dx, dy + ascent);
        console.info('draw', dx, dy + ascent, b.draw);
        return b.draw(ctx);
      });
      dx += b.width;
    }
    _results.push(dy += ascent + descent);
  }
  return _results;
};

with_page = function(options, draw_page) {
  var bottom_margin, boxes, canvas, ctx, defaults, height, left_margin, page, page_margin, right_margin, top_margin, width, _ref;
  if (CurrentPage) {
    throw new Error("Already inside a page");
  }
  defaults = {
    width: 100,
    height: 100,
    page_margin: 10
  };
  _ref = _.extend(defaults, options), width = _ref.width, height = _ref.height, page_margin = _ref.page_margin;
  left_margin = options.left_margin, top_margin = options.top_margin, right_margin = options.right_margin, bottom_margin = options.bottom_margin;
  if (left_margin == null) {
    left_margin = page_margin;
  }
  if (top_margin == null) {
    top_margin = page_margin;
  }
  if (right_margin == null) {
    right_margin = page_margin;
  }
  if (bottom_margin == null) {
    bottom_margin = page_margin;
  }
  canvas = Context.canvas || (Context.canvas = new Canvas(width + left_margin + right_margin, height + top_margin + bottom_margin, Mode));
  ctx = Context.ctx = canvas.getContext('2d');
  if (Mode === 'pdf') {
    ctx.textDrawingMode = 'glyph';
  }
  boxes = [];
  try {
    page = {
      left_margin: left_margin,
      top_margin: top_margin,
      right_margin: right_margin,
      bottom_margin: bottom_margin,
      width: canvas.width,
      height: canvas.height,
      context: ctx,
      box: function(options) {
        return boxes.push(box(options));
      }
    };
    CurrentPage = page;
    erase_background();
    with_graphics_context(function(ctx) {
      ctx.translate(left_margin, bottom_margin);
      if (CurrentBook != null) {
        if (typeof CurrentBook.header === "function") {
          CurrentBook.header(page);
        }
      }
      if (CurrentBook != null) {
        if (typeof CurrentBook.footer === "function") {
          CurrentBook.footer(page);
        }
      }
      if (typeof draw_page === "function") {
        draw_page(page);
      }
      return TDLRLayout(boxes);
    });
    switch (Mode) {
      case 'pdf':
        return ctx.addPage();
      default:
        filename = "" + (DefaultFilename || 'test') + ".png";
        fs.writeFile(path.join(BuildDirectory, filename), canvas.toBuffer());
        return console.info("Saved " + filename);
    }
  } finally {
    CurrentPage = null;
  }
};

with_grid = function(options, cb) {
  var cell, cell_height, cell_width, cols, defaults, gutter_height, gutter_width, header_height, overflow, rows, _i, _len, _results;
  defaults = {
    gutter_width: 10,
    gutter_height: 10,
    header_height: 0
  };
  options = _.extend(defaults, options);
  cols = options.cols, rows = options.rows, cell_width = options.cell_width, cell_height = options.cell_height, header_height = options.header_height, gutter_width = options.gutter_width, gutter_height = options.gutter_height;
  options.width || (options.width = cols * cell_width + (cols - 1) * gutter_width);
  options.height || (options.height = header_height + rows * cell_height + (rows - 1) * gutter_height);
  overflow = [];
  with_page(options, function(page) {
    return cb({
      context: page.context,
      rows: rows,
      cols: cols,
      row: 0,
      col: 0,
      add_cell: function(draw_fn) {
        var col, row, _ref, _ref1, _ref2;
        _ref = [this.col, this.row], col = _ref[0], row = _ref[1];
        if (row >= rows) {
          overflow.push({
            col: col,
            row: row,
            draw_fn: draw_fn
          });
        } else {
          with_graphics_context(function(ctx) {
            ctx.translate(col * (cell_width + gutter_width), header_height + row * (cell_height + gutter_height));
            return draw_fn();
          });
        }
        col += 1;
        if (col >= cols) {
          _ref1 = [0, row + 1], col = _ref1[0], row = _ref1[1];
        }
        return _ref2 = [col, row], this.col = _ref2[0], this.row = _ref2[1], _ref2;
      },
      start_row: function() {
        var _ref;
        if (this.col > 0) {
          return _ref = [0, this.row + 1], this.col = _ref[0], this.row = _ref[1], _ref;
        }
      }
    });
  });
  _results = [];
  while (overflow.length) {
    for (_i = 0, _len = overflow.length; _i < _len; _i++) {
      cell = overflow[_i];
      cell.row -= rows;
    }
    with_page(options, function(page) {
      var col, draw_fn, row, _j, _len1, _ref, _ref1, _results1;
      _ref = _.select(overflow, function(cell) {
        return cell.row < rows;
      });
      _results1 = [];
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        _ref1 = _ref[_j], col = _ref1.col, row = _ref1.row, draw_fn = _ref1.draw_fn;
        _results1.push(with_graphics_context(function(ctx) {
          ctx.translate(col * (cell_width + gutter_width), header_height + row * (cell_height + gutter_height));
          return draw_fn();
        }));
      }
      return _results1;
    });
    _results.push(overflow = (function() {
      var _j, _len1, _results1;
      _results1 = [];
      for (_j = 0, _len1 = overflow.length; _j < _len1; _j++) {
        cell = overflow[_j];
        if (cell.row >= rows) {
          _results1.push(cell);
        }
      }
      return _results1;
    })());
  }
  return _results;
};

with_book = function(filename, options, cb) {
  var book, canvas, ctx, height, page_count, page_limit, size, width, _ref, _ref1;
  if (CurrentBook) {
    throw new Error("with_book called recursively");
  }
  if (_.isFunction(options)) {
    _ref = [{}, options], options = _ref[0], cb = _ref[1];
  }
  page_limit = options.page_limit;
  page_count = 0;
  try {
    book = {
      page_options: {}
    };
    Mode = 'pdf';
    CurrentBook = book;
    size = options.size;
    if (size) {
      _ref1 = get_page_size_dimensions(size), width = _ref1.width, height = _ref1.height;
      _.extend(book.page_options, {
        width: width,
        height: height
      });
      canvas = Context.canvas || (Context.canvas = new Canvas(width, height, Mode));
      ctx = Context.ctx = canvas.getContext('2d');
      if (Mode === 'pdf') {
        ctx.textDrawingMode = 'glyph';
      }
    }
    cb({
      page_header: function(header) {
        return book.header = header;
      },
      page_footer: function(footer) {
        return book.footer = footer;
      },
      with_page: function(options, draw_page) {
        var _ref2;
        if (_.isFunction(options)) {
          _ref2 = [{}, options], options = _ref2[0], draw_page = _ref2[1];
        }
        if (this.done) {
          return;
        }
        options = _.extend({}, book.page_options, options);
        page_count += 1;
        if (CurrentPage) {
          draw_page(CurrentPage);
        } else {
          with_page(options, draw_page);
        }
        if (page_limit && page_limit <= page_count) {
          return this.done = true;
        }
      }
    });
    if (canvas) {
      return write_pdf(canvas, path.join(BuildDirectory, "" + filename + ".pdf"));
    } else {
      return console.warn("No pages");
    }
  } finally {
    CurrentBook = null;
    Mode = null;
    canvas = null;
    ctx = null;
  }
};

write_pdf = function(canvas, pathname) {
  return fs.writeFile(pathname, canvas.toBuffer(), function(err) {
    if (err) {
      return console.error("Error " + err.code + " writing to " + err.path);
    } else {
      return console.info("Saved " + pathname);
    }
  });
};

module.exports = {
  PaperSizes: PaperSizes,
  above: above,
  with_book: with_book,
  with_grid: with_grid,
  with_grid_boxes: with_grid_boxes,
  with_page: with_page,
  draw_text: draw_text,
  box: box,
  hbox: hbox,
  pad_box: pad_box,
  text_box: text_box,
  labeled: labeled,
  measure_text: measure_text,
  directory: directory,
  filename: filename,
  with_graphics_context: with_graphics_context,
  withCanvas: with_canvas
};


},{"canvas":"8QyYb9","fs":13,"path":14,"underscore":25,"util":20}],"wiIDa2":[function(require,module,exports){
var ChordDiagramStyle, PI, block, cos, draw_pitch_diagram, max, min, pitch_diagram_block, sin, with_graphics_context, _ref;

PI = Math.PI, cos = Math.cos, sin = Math.sin, min = Math.min, max = Math.max;

ChordDiagramStyle = require('./chord_diagram').defaultStyle;

_ref = require('./layout'), block = _ref.block, with_graphics_context = _ref.with_graphics_context;

draw_pitch_diagram = function(ctx, pitch_classes, options) {
  var angle, bounds, class_name, extend_bounds, m, pitch_class, pitch_class_angle, pitch_colors, pitch_names, r, r_label, x, y, _i, _j, _len, _len1;
  if (options == null) {
    options = {
      draw: true
    };
  }
  pitch_colors = options.pitch_colors, pitch_names = options.pitch_names;
  pitch_colors || (pitch_colors = ChordDiagramStyle.interval_class_colors);
  pitch_names || (pitch_names = 'R m2 M2 m3 M3 P4 TT P5 m6 M6 m7 M7'.split(/\s/));
  r = 10;
  r_label = r + 7;
  pitch_class_angle = function(pitch_class) {
    return (pitch_class - 3) * 2 * PI / 12;
  };
  bounds = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  };
  extend_bounds = function(left, top, bottom, right) {
    bounds.left = min(bounds.left, left);
    bounds.top = min(bounds.top, top);
    bounds.right = max(bounds.right, right != null ? right : left);
    return bounds.bottom = max(bounds.bottom, bottom != null ? bottom : top);
  };
  for (_i = 0, _len = pitch_classes.length; _i < _len; _i++) {
    pitch_class = pitch_classes[_i];
    angle = pitch_class_angle(pitch_class);
    x = r * cos(angle);
    y = r * sin(angle);
    if (options.draw) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    extend_bounds(x, y);
    if (options.draw) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * PI, false);
      ctx.fillStyle = pitch_colors[pitch_class] || 'black';
      ctx.fill();
    }
  }
  ctx.font = '4pt Times';
  ctx.fillStyle = 'black';
  for (pitch_class = _j = 0, _len1 = pitch_names.length; _j < _len1; pitch_class = ++_j) {
    class_name = pitch_names[pitch_class];
    angle = pitch_class_angle(pitch_class);
    m = ctx.measureText(class_name);
    x = r_label * cos(angle) - m.width / 2;
    y = r_label * sin(angle) + m.emHeightDescent;
    if (options.draw) {
      ctx.fillText(class_name, x, y);
    }
    bounds.left = min(bounds.left, x);
    bounds.right = max(bounds.right, x + m.width);
    bounds.top = min(bounds.top, y - m.emHeightAscent);
    bounds.bottom = max(bounds.bottom, y + m.emHeightAscent);
  }
  return bounds;
};

pitch_diagram_block = function(pitch_classes, scale) {
  var bounds;
  if (scale == null) {
    scale = 1;
  }
  bounds = with_graphics_context(function(ctx) {
    return draw_pitch_diagram(ctx, pitch_classes, {
      draw: false,
      measure: true
    });
  });
  return block({
    width: (bounds.right - bounds.left) * scale,
    height: (bounds.bottom - bounds.top) * scale,
    draw: function() {
      return with_graphics_context(function(ctx) {
        ctx.scale(scale, scale);
        ctx.translate(-bounds.left, -bounds.bottom);
        return draw_pitch_diagram(ctx, pitch_classes);
      });
    }
  });
};

module.exports = {
  draw: draw_pitch_diagram,
  block: pitch_diagram_block
};


},{"./chord_diagram":"kgIvBT","./layout":"ThjNWR"}],"AmyBcu":[function(require,module,exports){
var Chord, ChordDefinitions, Chords, Functions, IntervalNames, LongIntervalNames, Modes, NoteNames, Scales, abbrs, chord, full_name, interval_class_between, key, name, _, _i, _j, _len, _len1, _ref;

_ = require('underscore');

NoteNames = "G# A A# B C C# D D# E F F# G".split(/\s/);

IntervalNames = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'];

LongIntervalNames = ['Unison', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th', 'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th', 'Octave'];

Scales = (function() {
  var i, name, scale_specs, scales, spec, tones, _i, _len, _ref;
  scale_specs = ['Diatonic Major: 024579e', 'Natural Minor: 023578t', 'Melodic Minor: 023579e', 'Harmonic Minor: 023578e', 'Pentatonic Major: 02479', 'Pentatonic Minor: 0357t', 'Blues: 03567t', 'Freygish: 014578t', 'Whole Tone: 02468t', 'Octatonic: 0235689e'];
  scales = [];
  for (i = _i = 0, _len = scale_specs.length; _i < _len; i = ++_i) {
    spec = scale_specs[i];
    _ref = spec.split(/:\s*/, 2), name = _ref[0], tones = _ref[1];
    tones = _.map(tones, function(c) {
      return {
        't': 10,
        'e': 11
      }[c] || Number(c);
    });
    scales[name] = scales[i] = {
      name: name,
      tones: tones
    };
  }
  return scales;
})();

Modes = (function(root_tones) {
  var d, displacement, i, mode_names, modes, name, tones, _i, _len;
  mode_names = 'Ionian Dorian Phrygian Lydian Mixolydian Aeolian Locrian'.split(/\s/);
  modes = [];
  for (i = _i = 0, _len = root_tones.length; _i < _len; i = ++_i) {
    displacement = root_tones[i];
    name = mode_names[i];
    tones = (function() {
      var _j, _len1, _ref, _results;
      _ref = root_tones.slice(i).concat(root_tones.slice(0, i));
      _results = [];
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        d = _ref[_j];
        _results.push((d - displacement + 12) % 12);
      }
      return _results;
    })();
    modes[name] = modes[i] = {
      name: name,
      degree: i,
      tones: tones
    };
  }
  return modes;
})(Scales['Diatonic Major'].tones);

Functions = 'Tonic Supertonic Mediant Subdominant Dominant Submediant Subtonic Leading'.split(/\s/);

Chord = (function() {
  function Chord(options) {
    var degree, degrees, i, name, pc, pci;
    this.name = options.name;
    this.full_name = options.full_name;
    this.abbrs = options.abbrs || [options.abbr];
    if (typeof this.abbrs === 'string') {
      this.abbrs = this.abbrs.split(/s/);
    }
    this.abbr = options.abbr || this.abbrs[0];
    this.pitch_classes = options.pitch_classes;
    this.root = options.root;
    if (typeof this.root === 'string') {
      this.root = NoteNames.indexOf(this.root);
    }
    degrees = (function() {
      var _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.pitch_classes.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(1 + 2 * i);
      }
      return _results;
    }).call(this);
    degrees[1] = {
      'Sus2': 2,
      'Sus4': 4
    }[this.name] || degrees[1];
    if (this.name.match(/6/)) {
      degrees[3] = 6;
    }
    this.components = (function() {
      var _i, _len, _ref, _ref1, _ref2, _ref3, _results;
      _ref = this.pitch_classes;
      _results = [];
      for (pci = _i = 0, _len = _ref.length; _i < _len; pci = ++_i) {
        pc = _ref[pci];
        name = IntervalNames[pc];
        degree = degrees[pci];
        if (pc === 0) {
          name = 'R';
        } else if (Number((_ref1 = name.match(/\d+/)) != null ? _ref1[0] : void 0) !== degree) {
          if (Number((_ref2 = IntervalNames[pc - 1].match(/\d+/)) != null ? _ref2[0] : void 0) === degree) {
            name = "A" + degree;
          }
          if (Number((_ref3 = IntervalNames[pc + 1].match(/\d+/)) != null ? _ref3[0] : void 0) === degree) {
            name = "d" + degree;
          }
        }
        _results.push(name);
      }
      return _results;
    }).call(this);
    if (typeof this.root === 'number') {
      Object.defineProperty(this, 'name', {
        get: function() {
          return "" + NoteNames[this.root] + this.abbr;
        }
      });
    }
  }

  Chord.prototype.at = function(root) {
    return new Chord({
      name: this.name,
      full_name: this.full_name,
      abbrs: this.abbrs,
      pitch_classes: this.pitch_classes,
      root: root
    });
  };

  Chord.prototype.degree_name = function(degree_index) {
    return this.components[degree_index];
  };

  return Chord;

})();

ChordDefinitions = [
  {
    name: 'Major',
    abbrs: ['', 'M'],
    pitch_classes: '047'
  }, {
    name: 'Minor',
    abbr: 'm',
    pitch_classes: '037'
  }, {
    name: 'Augmented',
    abbrs: ['+', 'aug'],
    pitch_classes: '048'
  }, {
    name: 'Diminished',
    abbrs: ['°', 'dim'],
    pitch_classes: '036'
  }, {
    name: 'Sus2',
    abbr: 'sus2',
    pitch_classes: '027'
  }, {
    name: 'Sus4',
    abbr: 'sus4',
    pitch_classes: '057'
  }, {
    name: 'Dominant 7th',
    abbrs: ['7', 'dom7'],
    pitch_classes: '047t'
  }, {
    name: 'Augmented 7th',
    abbrs: ['+7', '7aug'],
    pitch_classes: '048t'
  }, {
    name: 'Diminished 7th',
    abbrs: ['°7', 'dim7'],
    pitch_classes: '0369'
  }, {
    name: 'Major 7th',
    abbr: 'maj7',
    pitch_classes: '047e'
  }, {
    name: 'Minor 7th',
    abbr: 'min7',
    pitch_classes: '037t'
  }, {
    name: 'Dominant 7b5',
    abbr: '7b5',
    pitch_classes: '046t'
  }, {
    name: 'Minor 7th b5',
    abbrs: ['ø', 'Ø', 'm7b5'],
    pitch_classes: '036t'
  }, {
    name: 'Diminished Maj 7th',
    abbr: '°Maj7',
    pitch_classes: '036e'
  }, {
    name: 'Minor-Major 7th',
    abbrs: ['min/maj7', 'min(maj7)'],
    pitch_classes: '037e'
  }, {
    name: '6th',
    abbrs: ['6', 'M6', 'M6', 'maj6'],
    pitch_classes: '0479'
  }, {
    name: 'Minor 6th',
    abbrs: ['m6', 'min6'],
    pitch_classes: '0379'
  }
];

Chords = ChordDefinitions.map(function(spec) {
  spec.full_name = spec.name;
  spec.name = spec.name.replace(/Major(?!$)/, 'Maj').replace(/Minor(?!$)/, 'Min').replace('Dominant', 'Dom').replace('Diminished', 'Dim');
  spec.abbrs || (spec.abbrs = [spec.abbr]);
  if (typeof spec.abbrs === 'string') {
    spec.abbrs = spec.abbrs.split(/s/);
  }
  spec.abbr || (spec.abbr = spec.abbrs[0]);
  spec.pitch_classes = _.map(spec.pitch_classes, function(c) {
    return {
      't': 10,
      'e': 11
    }[c] || Number(c);
  });
  return new Chord(spec);
});

for (_i = 0, _len = Chords.length; _i < _len; _i++) {
  chord = Chords[_i];
  name = chord.name, full_name = chord.full_name, abbrs = chord.abbrs;
  _ref = [name, full_name].concat(abbrs);
  for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
    key = _ref[_j];
    Chords[key] = chord;
  }
}

interval_class_between = function(pca, pcb) {
  var n;
  n = (pcb - pca) % 12;
  while (n < 0) {
    n += 12;
  }
  return n;
};

module.exports = {
  Chords: Chords,
  IntervalNames: IntervalNames,
  LongIntervalNames: LongIntervalNames,
  Modes: Modes,
  NoteNames: NoteNames,
  Scales: Scales,
  interval_class_between: interval_class_between
};


},{"underscore":25}],"VD5hCQ":[function(require,module,exports){
var hsv2css, hsv2rgb, rgb2css, _base, _base1;

(_base = Function.prototype).define || (_base.define = function(name, desc) {
  return Object.defineProperty(this.prototype, name, desc);
});

(_base1 = Function.prototype).cached_getter || (_base1.cached_getter = function(name, fn) {
  return Object.defineProperty(this.prototype, name, {
    get: function() {
      var cache;
      cache = this._getter_cache || (this._getter_cache = {});
      if (name in cache) {
        return cache[name];
      }
      return cache[name] = fn.call(this);
    }
  });
});

hsv2rgb = function(_arg) {
  var b, c, component, components, g, h, r, s, v, x, _ref;
  h = _arg.h, s = _arg.s, v = _arg.v;
  h /= 360;
  c = v * s;
  x = c * (1 - Math.abs((h * 6) % 2 - 1));
  components = (function() {
    switch (Math.floor(h * 6) % 6) {
      case 0:
        return [c, x, 0];
      case 1:
        return [x, c, 0];
      case 2:
        return [0, c, x];
      case 3:
        return [0, x, c];
      case 4:
        return [x, 0, c];
      case 5:
        return [c, 0, x];
    }
  })();
  _ref = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = components.length; _i < _len; _i++) {
      component = components[_i];
      _results.push(component + v - c);
    }
    return _results;
  })(), r = _ref[0], g = _ref[1], b = _ref[2];
  return {
    r: r,
    g: g,
    b: b
  };
};

rgb2css = function(_arg) {
  var b, c, g, r, _ref;
  r = _arg.r, g = _arg.g, b = _arg.b;
  _ref = (function() {
    var _i, _len, _ref, _results;
    _ref = [r, g, b];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      c = _ref[_i];
      _results.push(Math.floor(255 * c));
    }
    return _results;
  })(), r = _ref[0], g = _ref[1], b = _ref[2];
  return "rgb(" + r + ", " + g + ", " + b + ")";
};

hsv2css = function(hsv) {
  return rgb2css(hsv2rgb(hsv));
};

module.exports = {
  hsv2css: hsv2css,
  hsv2rgb: hsv2rgb,
  rgb2css: rgb2css
};


},{}],12:[function(require,module,exports){
var process=require("__browserify_process");if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (typeof emitter._events[type] === 'function')
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

},{"__browserify_process":24}],13:[function(require,module,exports){
// nothing to see here... no file methods for the browser

},{}],14:[function(require,module,exports){
var process=require("__browserify_process");function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';

},{"__browserify_process":24}],"./layout":[function(require,module,exports){
module.exports=require('ThjNWR');
},{}],"./utils":[function(require,module,exports){
module.exports=require('VD5hCQ');
},{}],"./fretboard_model":[function(require,module,exports){
module.exports=require('dVmYil');
},{}],"./chord_diagram":[function(require,module,exports){
module.exports=require('kgIvBT');
},{}],"./fretboard_logic":[function(require,module,exports){
module.exports=require('YoMTGX');
},{}],20:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\u001b[' + styles[style][0] + 'm' + str +
             '\u001b[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return Array.isArray(ar) ||
         (typeof ar === 'object' && Object.prototype.toString.call(ar) === '[object Array]');
}


function isRegExp(re) {
  typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]';
}


function isDate(d) {
  return typeof d === 'object' && Object.prototype.toString.call(d) === '[object Date]';
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":12}],"./fretboard_diagram":[function(require,module,exports){
module.exports=require('JjUvl1');
},{}],"./theory":[function(require,module,exports){
module.exports=require('AmyBcu');
},{}],"canvas":[function(require,module,exports){
module.exports=require('8QyYb9');
},{}],24:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],25:[function(require,module,exports){
//     Underscore.js 1.4.4
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? null : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(context, args.concat(slice.call(arguments)));
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

},{}],"./pitch_diagram":[function(require,module,exports){
module.exports=require('wiIDa2');
},{}],"./harmonic_table":[function(require,module,exports){
module.exports=require('L0flg7');
},{}]},{},[1,"8QyYb9","kgIvBT","JjUvl1","YoMTGX","dVmYil","L0flg7","ThjNWR","wiIDa2","AmyBcu","VD5hCQ"])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC1sb2dpYy9hcHAvanMvYXBwLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL2xpYi9icm93c2VyL2NhbnZhcy5jb2ZmZWUiLCIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC1sb2dpYy9saWIvY2hvcmRfZGlhZ3JhbS5jb2ZmZWUiLCIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC1sb2dpYy9saWIvZnJldGJvYXJkX2RpYWdyYW0uY29mZmVlIiwiL1VzZXJzL29zdGVlbGUvQ29kZS9mcmV0Ym9hcmQtbG9naWMvbGliL2ZyZXRib2FyZF9sb2dpYy5jb2ZmZWUiLCIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC1sb2dpYy9saWIvZnJldGJvYXJkX21vZGVsLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL2xpYi9oYXJtb25pY190YWJsZS5jb2ZmZWUiLCIvVXNlcnMvb3N0ZWVsZS9Db2RlL2ZyZXRib2FyZC1sb2dpYy9saWIvbGF5b3V0LmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL2xpYi9waXRjaF9kaWFncmFtLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL2xpYi90aGVvcnkuY29mZmVlIiwiL1VzZXJzL29zdGVlbGUvQ29kZS9mcmV0Ym9hcmQtbG9naWMvbGliL3V0aWxzLmNvZmZlZSIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL2J1aWx0aW4vZXZlbnRzLmpzIiwiL1VzZXJzL29zdGVlbGUvQ29kZS9mcmV0Ym9hcmQtbG9naWMvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvYnVpbHRpbi9mcy5qcyIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL2J1aWx0aW4vcGF0aC5qcyIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL2J1aWx0aW4vdXRpbC5qcyIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9vc3RlZWxlL0NvZGUvZnJldGJvYXJkLWxvZ2ljL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUEsNkxBQUE7O0FBQUEsQ0FBQSxFQUFlLElBQUEsS0FBZixLQUFlOztBQUNmLENBREEsRUFDUyxHQUFULENBQVMsR0FBQTs7QUFFVCxDQUhBLENBSUUsS0FHRSxPQUpKLElBQUEsQ0FJSSxNQVBKOztBQVNBLENBVEEsQ0FVRSxHQURGLENBQUEsQ0FRSSxDQUFBLENBUkosQ0FRSSxHQVJKLElBQUEsS0FUQTs7QUFxQkEsQ0FyQkEsRUFxQmdDLEVBQWhDLEVBQU8sQ0FBUCxDQUFnQztDQUN0QixDQUFvQixLQUFyQixDQUFQLENBQUEsS0FBNEI7Q0FERTs7QUFHaEMs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QUFhO0NBQUE7VUFBQSxpQ0FBQTtvQkFBQTtDQUFBLEVBQVcsQ0FBUCxDQUFKO0NBQUE7O0NBQWIsQ0FBQztDQUNBLEVBQUssQ0FBTCxFQUFBLEdBQUE7Q0FGTzs7QUFJVixDQTNCQSxFQTJCVSxJQUFWLEVBQVc7Q0FBZ0IsRUFBQSxJQUFSLEVBQUE7Q0FBVDs7QUFFVixDQTdCQSxFQTZCaUIsR0FBWCxDQUFOO0NBQWlCLENBQ2YsS0FEZTtDQUFBLENBRWYsS0FGZTtDQUFBLENBR2YsS0FIZTtDQTdCakIsQ0FBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDakxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ3pWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJDaG9yZERpYWdyYW0gPSByZXF1aXJlICcuL2Nob3JkX2RpYWdyYW0nXG5MYXlvdXQgPSByZXF1aXJlICcuL2xheW91dCdcblxue1xuICBiZXN0X2ZpbmdlcmluZ19mb3JcbiAgZmluZ2VyaW5nc19mb3JcbiAgZmluZ2VyX3Bvc2l0aW9uc19vbl9jaG9yZFxufSA9IHJlcXVpcmUoJy4vZnJldGJvYXJkX2xvZ2ljJylcblxue1xuICBDaG9yZHNcbiAgTm90ZU5hbWVzXG4gIEludGVydmFsTmFtZXNcbiAgTG9uZ0ludGVydmFsTmFtZXNcbiAgTW9kZXNcbiAgU2NhbGVzXG4gIGludGVydmFsX2NsYXNzX2JldHdlZW5cbn0gPSByZXF1aXJlKCcuL3RoZW9yeScpXG5cblxuIyByZXF1aXJlanMgbmVjZXNzaXRhdGVzIHRoaXNcbmFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkucmVhZHkgLT5cbiAgYW5ndWxhci5ib290c3RyYXAoZG9jdW1lbnQsIFsnRnJldGJvYXJkQXBwJ10pXG5cbmFwcCA9IGFuZ3VsYXIubW9kdWxlICdGcmV0Ym9hcmRBcHAnLCBbXVxuXG5hcHAuY29udHJvbGxlciAnQ2hvcmRDdHJsJywgKCRzY29wZSkgLT5cblxuYXBwLmRpcmVjdGl2ZSAnY2hvcmQnLCAtPlxuICByZXN0cmljdDogJ0NFJ1xuICByZXBsYWNlOiB0cnVlXG4gIHRlbXBsYXRlOiAnPGNhbnZhcyB3aWR0aD1cIjkwXCIgaGVpZ2h0PVwiMTAwXCIvPidcbiAgdHJhbnNjbHVkZTogdHJ1ZVxuICBzY29wZToge25hbWU6ICdAJ31cbiAgbGluazogKHNjb3BlLCBlbGVtZW50LCBhdHRycykgLT5cbiAgICBjYW52YXMgPSBlbGVtZW50WzBdXG4gICAgYXR0cnMuJG9ic2VydmUgJ25hbWUnLCAoY2hvcmROYW1lKSAtPlxuICAgICAgY2hvcmQgPSBDaG9yZHMuTWFqb3IuYXQoJ0UnKVxuICAgICAgZmluZ2VyaW5ncyA9IGZpbmdlcmluZ3NfZm9yIGNob3JkXG4gICAgICBmaW5nZXJpbmcgPSBmaW5nZXJpbmdzWzBdXG4gICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgQ2hvcmREaWFncmFtLmRyYXcgY3R4LCBmaW5nZXJpbmcucG9zaXRpb25zLCBiYXJyZXM6IGZpbmdlcmluZy5iYXJyZXNcbiIsIlxuIiwiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG5cbntcbiAgRnJldENvdW50XG4gIEZyZXROdW1iZXJzXG4gIFN0cmluZ0NvdW50XG4gIFN0cmluZ051bWJlcnNcbn0gPSByZXF1aXJlICcuL2ZyZXRib2FyZF9tb2RlbCdcbkxheW91dCA9IHJlcXVpcmUgJy4vbGF5b3V0J1xuXG5cbiNcbiMgU3R5bGVcbiNcblxue2hzdjJjc3N9ID0gcmVxdWlyZSAnLi91dGlscydcblxuU21hbGxTdHlsZSA9XG4gIGhfZ3V0dGVyOiA1XG4gIHZfZ3V0dGVyOiA1XG4gIHN0cmluZ19zcGFjaW5nOiA2XG4gIGZyZXRfaGVpZ2h0OiA4XG4gIGFib3ZlX2ZyZXRib2FyZDogOFxuICBub3RlX3JhZGl1czogMVxuICBjbG9zZWRfc3RyaW5nX2ZvbnRzaXplOiA0XG4gIGNob3JkX2RlZ3JlZV9jb2xvcnM6IFsncmVkJywgJ2JsdWUnLCAnZ3JlZW4nLCAnb3JhbmdlJ11cbiAgaW50ZXJ2YWxfY2xhc3NfY29sb3JzOiBbMC4uLjEyXS5tYXAgKG4pIC0+XG4gICAgIyBpID0gKDcgKiBuKSAlIDEyICAjIGNvbG9yIGJ5IGNpcmNsZSBvZiBmaWZ0aCBhc2NlbnNpb25cbiAgICBoc3YyY3NzIGg6IG4gKiAzNjAgLyAxMiwgczogMSwgdjogMVxuXG5EZWZhdWx0U3R5bGUgPSBfLmV4dGVuZCB7fSwgU21hbGxTdHlsZSxcbiAgc3RyaW5nX3NwYWNpbmc6IDEyXG4gIGZyZXRfaGVpZ2h0OiAxNlxuICBub3RlX3JhZGl1czogM1xuICBjbG9zZWRfc3RyaW5nX2ZvbnRzaXplOiA4XG5cbmNvbXB1dGVfZGltZW5zaW9ucyA9IChzdHlsZT1EZWZhdWx0U3R5bGUpIC0+XG4gIHtcbiAgICB3aWR0aDogMiAqIHN0eWxlLmhfZ3V0dGVyICsgKFN0cmluZ0NvdW50IC0gMSkgKiBzdHlsZS5zdHJpbmdfc3BhY2luZ1xuICAgIGhlaWdodDogMiAqIHN0eWxlLnZfZ3V0dGVyICsgKHN0eWxlLmZyZXRfaGVpZ2h0ICsgMikgKiBGcmV0Q291bnRcbiAgfVxuXG5cbiNcbiMgRHJhd2luZyBNZXRob2RzXG4jXG5cbmRyYXdfY2hvcmRfZGlhZ3JhbV9zdHJpbmdzID0gKGN0eCwgb3B0aW9ucz17fSkgLT5cbiAgc3R5bGUgPSBEZWZhdWx0U3R5bGVcbiAgZm9yIHN0cmluZyBpbiBTdHJpbmdOdW1iZXJzXG4gICAgeCA9IHN0cmluZyAqIHN0eWxlLnN0cmluZ19zcGFjaW5nICsgc3R5bGUuaF9ndXR0ZXJcbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBjdHgubW92ZVRvIHgsIHN0eWxlLnZfZ3V0dGVyICsgc3R5bGUuYWJvdmVfZnJldGJvYXJkXG4gICAgY3R4LmxpbmVUbyB4LCBzdHlsZS52X2d1dHRlciArIHN0eWxlLmFib3ZlX2ZyZXRib2FyZCArIEZyZXRDb3VudCAqIHN0eWxlLmZyZXRfaGVpZ2h0XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gKGlmIG9wdGlvbnMuZGltX3N0cmluZ3MgYW5kIHN0cmluZyBpbiBvcHRpb25zLmRpbV9zdHJpbmdzIHRoZW4gJ3JnYmEoMCwwLDAsMC4yKScgZWxzZSAnYmxhY2snKVxuICAgIGN0eC5zdHJva2UoKVxuXG5kcmF3X2Nob3JkX2RpYWdyYW1fZnJldHMgPSAoY3R4LCB7bnV0fT17bnV0OiB0cnVlfSkgLT5cbiAgc3R5bGUgPSBEZWZhdWx0U3R5bGVcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJ1xuICBmb3IgZnJldCBpbiBGcmV0TnVtYmVyc1xuICAgIHkgPSBzdHlsZS52X2d1dHRlciArIHN0eWxlLmFib3ZlX2ZyZXRib2FyZCArIGZyZXQgKiBzdHlsZS5mcmV0X2hlaWdodFxuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC5tb3ZlVG8gc3R5bGUudl9ndXR0ZXIgLSAwLjUsIHlcbiAgICBjdHgubGluZVRvIHN0eWxlLnZfZ3V0dGVyICsgMC41ICsgKFN0cmluZ0NvdW50IC0gMSkgKiBzdHlsZS5zdHJpbmdfc3BhY2luZywgeVxuICAgIGN0eC5saW5lV2lkdGggPSAzIGlmIGZyZXQgPT0gMCBhbmQgbnV0XG4gICAgY3R4LnN0cm9rZSgpXG4gICAgY3R4LmxpbmVXaWR0aCA9IDFcblxuZHJhd19jaG9yZF9kaWFncmFtID0gKGN0eCwgcG9zaXRpb25zLCBvcHRpb25zPXt9KSAtPlxuICBkZWZhdWx0cyA9IHtkcmF3X2Nsb3NlZF9zdHJpbmdzOiB0cnVlLCBudXQ6IHRydWUsIGR5OiAwLCBzdHlsZTogRGVmYXVsdFN0eWxlfVxuICBvcHRpb25zID0gXy5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnNcbiAge2JhcnJlcywgZHksIGRyYXdfY2xvc2VkX3N0cmluZ3MsIHN0eWxlfSA9IG9wdGlvbnNcbiAgaWYgb3B0aW9ucy5kaW1fdW51c2VkX3N0cmluZ3NcbiAgICB1c2VkX3N0cmluZ3MgPSAoc3RyaW5nIGZvciB7c3RyaW5nfSBpbiBwb3NpdGlvbnMpXG4gICAgb3B0aW9ucy5kaW1fc3RyaW5ncyA9IChzdHJpbmcgZm9yIHN0cmluZyBpbiBTdHJpbmdOdW1iZXJzIHdoZW4gc3RyaW5nIG5vdCBpbiB1c2VkX3N0cmluZ3MpXG5cbiAgZmluZ2VyX2Nvb3JkaW5hdGVzID0gKHtzdHJpbmcsIGZyZXR9KSAtPlxuICAgIHJldHVybiB7XG4gICAgICB4OiBzdHlsZS5oX2d1dHRlciArIHN0cmluZyAqIHN0eWxlLnN0cmluZ19zcGFjaW5nLFxuICAgICAgeTogc3R5bGUudl9ndXR0ZXIgKyBzdHlsZS5hYm92ZV9mcmV0Ym9hcmQgKyAoZnJldCAtIDAuNSkgKiBzdHlsZS5mcmV0X2hlaWdodCArIGR5XG4gICAgfVxuXG4gIGRyYXdfZmluZ2VyX3Bvc2l0aW9uID0gKHBvc2l0aW9uLCBvcHRpb25zPXt9KSAtPlxuICAgIHtpc19yb290LCBjb2xvcn0gPSBvcHRpb25zXG4gICAge3gsIHl9ID0gZmluZ2VyX2Nvb3JkaW5hdGVzIHBvc2l0aW9uXG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yIG9yIChpZiBpc19yb290IHRoZW4gJ3JlZCcgZWxzZSAnd2hpdGUnKVxuICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yIG9yIChpZiBpc19yb290IHRoZW4gJ3JlZCcgZWxzZSAnYmxhY2snKVxuICAgIGN0eC5saW5lV2lkdGggPSAxXG4gICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgaWYgaXNfcm9vdCBhbmQgcG9zaXRpb24uZnJldFxuICAgICAgZG8gKHI9c3R5bGUubm90ZV9yYWRpdXMpIC0+XG4gICAgICAgIGN0eC5yZWN0IHggLSByLCB5IC0gciwgMiAqIHIsIDIgKiByXG4gICAgZWxzZVxuICAgICAgY3R4LmFyYyB4LCB5LCBzdHlsZS5ub3RlX3JhZGl1cywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlXG4gICAgY3R4LmZpbGwoKSBpZiBwb3NpdGlvbi5mcmV0ID4gMCBvciBpc19yb290XG4gICAgY3R4LnN0cm9rZSgpXG5cbiAgZHJhd19iYXJyZXMgPSAtPlxuICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snXG4gICAgZm9yIHtmcmV0LCBzdHJpbmcsIGZyZXQsIHN0cmluZ19jb3VudH0gaW4gYmFycmVzXG4gICAgICB7eDogeDEsIHl9ID0gZmluZ2VyX2Nvb3JkaW5hdGVzIHtzdHJpbmcsIGZyZXR9XG4gICAgICB7eDogeDJ9ID0gZmluZ2VyX2Nvb3JkaW5hdGVzIHtzdHJpbmc6IHN0cmluZyArIHN0cmluZ19jb3VudCAtIDEsIGZyZXR9XG4gICAgICB3ID0geDIgLSB4MVxuICAgICAgY3R4LnNhdmUoKVxuICAgICAgY3R4LnRyYW5zbGF0ZSAoeDEgKyB4MikgLyAyLCB5IC0gc3R5bGUuZnJldF9oZWlnaHQgKiAuMjVcbiAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgZWNjZW50cmljaXR5ID0gMTBcbiAgICAgIGRvIC0+XG4gICAgICAgIGN0eC5zYXZlKClcbiAgICAgICAgY3R4LnNjYWxlIHcsIGVjY2VudHJpY2l0eVxuICAgICAgICBjdHguYXJjIDAsIDAsIHN0eWxlLnN0cmluZ19zcGFjaW5nIC8gMiAvIGVjY2VudHJpY2l0eSwgTWF0aC5QSSwgMCwgZmFsc2VcbiAgICAgICAgY3R4LnJlc3RvcmUoKVxuICAgICAgZG8gLT5cbiAgICAgICAgY3R4LnNhdmUoKVxuICAgICAgICBjdHguc2NhbGUgdywgMTRcbiAgICAgICAgY3R4LmFyYyAwLCAwLCBzdHlsZS5zdHJpbmdfc3BhY2luZyAvIDIgLyBlY2NlbnRyaWNpdHksIDAsIE1hdGguUEksIHRydWVcbiAgICAgICAgY3R4LnJlc3RvcmUoKVxuICAgICAgY3R4LmZpbGwoKVxuICAgICAgY3R4LnJlc3RvcmUoKVxuICAgICAgIyBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwwLDAsIDAuNSknXG4gICAgICAjIGN0eC5iZWdpblBhdGgoKVxuICAgICAgIyBjdHguYXJjIHgxLCB5LCBzdHlsZS5zdHJpbmdfc3BhY2luZyAvIDIsIE1hdGguUEkgKiAxLzIsIE1hdGguUEkgKiAzLzIsIGZhbHNlXG4gICAgICAjIGN0eC5hcmMgeDIsIHksIHN0eWxlLnN0cmluZ19zcGFjaW5nIC8gMiwgTWF0aC5QSSAqIDMvMiwgTWF0aC5QSSAqIDEvMiwgZmFsc2VcbiAgICAgICMgY3R4LmZpbGwoKVxuXG4gIGRyYXdfZmluZ2VyX3Bvc2l0aW9ucyA9IC0+XG4gICAgZm9yIHBvc2l0aW9uIGluIHBvc2l0aW9uc1xuICAgICAgZGVmYXVsdF9vcHRpb25zID1cbiAgICAgICAgY29sb3I6IHN0eWxlLmludGVydmFsX2NsYXNzX2NvbG9yc1twb3NpdGlvbi5pbnRlcnZhbF9jbGFzc11cbiAgICAgICAgaXNfcm9vdDogKHBvc2l0aW9uLmludGVydmFsX2NsYXNzID09IDApXG4gICAgICBkcmF3X2Zpbmdlcl9wb3NpdGlvbiBwb3NpdGlvbiwgXy5leHRlbmQoZGVmYXVsdF9vcHRpb25zLCBwb3NpdGlvbilcblxuICBkcmF3X2Nsb3NlZF9zdHJpbmdzID0gLT5cbiAgICBmcmV0dGVkX3N0cmluZ3MgPSBbXVxuICAgIGZyZXR0ZWRfc3RyaW5nc1twb3NpdGlvbi5zdHJpbmddID0gdHJ1ZSBmb3IgcG9zaXRpb24gaW4gcG9zaXRpb25zXG4gICAgY2xvc2VkX3N0cmluZ3MgPSAoc3RyaW5nIGZvciBzdHJpbmcgaW4gU3RyaW5nTnVtYmVycyB3aGVuIG5vdCBmcmV0dGVkX3N0cmluZ3Nbc3RyaW5nXSlcbiAgICByID0gc3R5bGUubm90ZV9yYWRpdXNcbiAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJ1xuICAgIGZvciBzdHJpbmcgaW4gY2xvc2VkX3N0cmluZ3NcbiAgICAgIHt4LCB5fSA9IGZpbmdlcl9jb29yZGluYXRlcyB7c3RyaW5nLCBmcmV0OiAwfVxuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJ1xuICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICBjdHgubW92ZVRvIHggLSByLCB5IC0gclxuICAgICAgY3R4LmxpbmVUbyB4ICsgciwgeSArIHJcbiAgICAgIGN0eC5tb3ZlVG8geCAtIHIsIHkgKyByXG4gICAgICBjdHgubGluZVRvIHggKyByLCB5IC0gclxuICAgICAgY3R4LnN0cm9rZSgpXG5cbiAgZHJhd19jaG9yZF9kaWFncmFtX3N0cmluZ3MgY3R4LCBvcHRpb25zXG4gIGRyYXdfY2hvcmRfZGlhZ3JhbV9mcmV0cyBjdHgsIG51dDogb3B0aW9ucy5udXRcbiAgZHJhd19iYXJyZXMoKSBpZiBiYXJyZXNcbiAgZHJhd19maW5nZXJfcG9zaXRpb25zKCkgaWYgcG9zaXRpb25zXG4gIGRyYXdfY2xvc2VkX3N0cmluZ3MoKSBpZiBwb3NpdGlvbnMgYW5kIG9wdGlvbnMuZHJhd19jbG9zZWRfc3RyaW5nc1xuXG5kcmF3X2Nob3JkX2Jsb2NrID0gKHBvc2l0aW9ucywgb3B0aW9ucykgLT5cbiAgZGltZW5zaW9ucyA9IGNvbXB1dGVfZGltZW5zaW9ucygpXG4gIExheW91dC5ibG9ja1xuICAgIHdpZHRoOiBkaW1lbnNpb25zLndpZHRoXG4gICAgaGVpZ2h0OiBkaW1lbnNpb25zLmhlaWdodFxuICAgIGRyYXc6ICgpIC0+XG4gICAgICBMYXlvdXQud2l0aF9ncmFwaGljc19jb250ZXh0IChjdHgpIC0+XG4gICAgICAgIGN0eC50cmFuc2xhdGUgMCwgLWRpbWVuc2lvbnMuaGVpZ2h0XG4gICAgICAgIGRyYXdfY2hvcmRfZGlhZ3JhbSBjdHgsIHBvc2l0aW9ucywgb3B0aW9uc1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGRlZmF1bHRTdHlsZTogRGVmYXVsdFN0eWxlXG4gIHdpZHRoOiBjb21wdXRlX2RpbWVuc2lvbnMoKS53aWR0aFxuICBoZWlnaHQ6IGNvbXB1dGVfZGltZW5zaW9ucygpLmhlaWdodFxuICBkcmF3OiBkcmF3X2Nob3JkX2RpYWdyYW1cbiAgYmxvY2s6IGRyYXdfY2hvcmRfYmxvY2tcbiIsIntcbiAgRnJldENvdW50XG4gIEZyZXROdW1iZXJzXG4gIFN0cmluZ0NvdW50XG4gIFN0cmluZ051bWJlcnNcbn0gPSByZXF1aXJlICcuL2ZyZXRib2FyZF9tb2RlbCdcblxuXG4jXG4jIFN0eWxlXG4jXG5cbkRlZmF1bHRTdHlsZSA9XG4gIGhfZ3V0dGVyOiAxMFxuICB2X2d1dHRlcjogMTBcbiAgc3RyaW5nX3NwYWNpbmc6IDIwXG4gIGZyZXRfd2lkdGg6IDQ1XG4gIGZyZXRfb3Zlcmhhbmc6IC4zICogNDVcblxucGFkZGVkX2ZyZXRib2FyZF93aWR0aCA9IGRvIChzdHlsZT1EZWZhdWx0U3R5bGUpIC0+XG4gIDIgKiBzdHlsZS52X2d1dHRlciArIHN0eWxlLmZyZXRfd2lkdGggKiBGcmV0Q291bnQgKyBzdHlsZS5mcmV0X292ZXJoYW5nXG5cbnBhZGRlZF9mcmV0Ym9hcmRfaGVpZ2h0ID0gZG8gKHN0eWxlPURlZmF1bHRTdHlsZSkgLT5cbiAgMiAqIHN0eWxlLmhfZ3V0dGVyICsgKFN0cmluZ0NvdW50IC0gMSkgKiBzdHlsZS5zdHJpbmdfc3BhY2luZ1xuXG5cbiNcbiMgRHJhd2luZyBNZXRob2RzXG4jXG5cbmRyYXdfZnJldGJvYXJkX3N0cmluZ3MgPSAoY3R4KSAtPlxuICBzdHlsZSA9IERlZmF1bHRTdHlsZVxuICBmb3Igc3RyaW5nIGluIFN0cmluZ051bWJlcnNcbiAgICB5ID0gc3RyaW5nICogc3R5bGUuc3RyaW5nX3NwYWNpbmcgKyBzdHlsZS5oX2d1dHRlclxuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC5tb3ZlVG8gc3R5bGUuaF9ndXR0ZXIsIHlcbiAgICBjdHgubGluZVRvIHN0eWxlLmhfZ3V0dGVyICsgRnJldENvdW50ICogc3R5bGUuZnJldF93aWR0aCArIHN0eWxlLmZyZXRfb3ZlcmhhbmcsIHlcbiAgICBjdHgubGluZVdpZHRoID0gMVxuICAgIGN0eC5zdHJva2UoKVxuXG5kcmF3X2ZyZXRib2FyZF9mcmV0cyA9IChjdHgpIC0+XG4gIHN0eWxlID0gRGVmYXVsdFN0eWxlXG4gIGZvciBmcmV0IGluIEZyZXROdW1iZXJzXG4gICAgeCA9IHN0eWxlLmhfZ3V0dGVyICsgZnJldCAqIHN0eWxlLmZyZXRfd2lkdGhcbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBjdHgubW92ZVRvIHgsIHN0eWxlLmhfZ3V0dGVyXG4gICAgY3R4LmxpbmVUbyB4LCBzdHlsZS5oX2d1dHRlciArIChTdHJpbmdDb3VudCAtIDEpICogc3R5bGUuc3RyaW5nX3NwYWNpbmdcbiAgICBjdHgubGluZVdpZHRoID0gMyBpZiBmcmV0ID09IDBcbiAgICBjdHguc3Ryb2tlKClcbiAgICBjdHgubGluZVdpZHRoID0gMVxuXG5kcmF3X2ZyZXRib2FyZF9maW5nZXJfcG9zaXRpb24gPSAoY3R4LCBwb3NpdGlvbiwgb3B0aW9ucz17fSkgLT5cbiAge3N0cmluZywgZnJldH0gPSBwb3NpdGlvblxuICB7aXNfcm9vdCwgY29sb3J9ID0gb3B0aW9uc1xuICBzdHlsZSA9IERlZmF1bHRTdHlsZVxuICBjb2xvciB8fD0gaWYgaXNfcm9vdCB0aGVuICdyZWQnIGVsc2UgJ3doaXRlJ1xuICB4ID0gc3R5bGUuaF9ndXR0ZXIgKyAoZnJldCAtIDAuNSkgKiBzdHlsZS5mcmV0X3dpZHRoXG4gIHggPSBzdHlsZS5oX2d1dHRlciBpZiBmcmV0ID09IDBcbiAgeSA9IHN0eWxlLnZfZ3V0dGVyICsgKDUgLSBzdHJpbmcpICogc3R5bGUuc3RyaW5nX3NwYWNpbmdcbiAgY3R4LmJlZ2luUGF0aCgpXG4gIGN0eC5hcmMgeCwgeSwgNywgMCwgMiAqIE1hdGguUEksIGZhbHNlXG4gIGN0eC5maWxsU3R5bGUgPSBjb2xvclxuICBjdHgubGluZVdpZHRoID0gMiB1bmxlc3MgaXNfcm9vdFxuICBjdHguZmlsbCgpXG4gIGN0eC5zdHJva2UoKVxuICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snXG4gIGN0eC5saW5lV2lkdGggPSAxXG5cbmRyYXdfZnJldGJvYXJkID0gKGN0eCwgcG9zaXRpb25zKSAtPlxuICBkcmF3X2ZyZXRib2FyZF9zdHJpbmdzIGN0eFxuICBkcmF3X2ZyZXRib2FyZF9mcmV0cyBjdHhcbiAgZHJhd19mcmV0Ym9hcmRfZmluZ2VyX3Bvc2l0aW9uIGN0eCwgcG9zaXRpb24sIHBvc2l0aW9uIGZvciBwb3NpdGlvbiBpbiAocG9zaXRpb25zIG9yIFtdKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGRyYXc6IGRyYXdfZnJldGJvYXJkXG4gIGhlaWdodDogcGFkZGVkX2ZyZXRib2FyZF9oZWlnaHRcbiAgd2lkdGg6IHBhZGRlZF9mcmV0Ym9hcmRfd2lkdGhcbiIsInV0aWwgPSByZXF1aXJlICd1dGlsJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG57aW50ZXJ2YWxfY2xhc3NfYmV0d2Vlbn0gPSByZXF1aXJlICcuL3RoZW9yeSdcbkZyZXRib2FyZE1vZGVsID0gcmVxdWlyZSAnLi9mcmV0Ym9hcmRfbW9kZWwnXG5cbntcbiAgRnJldE51bWJlcnNcbiAgT3BlblN0cmluZ1BpdGNoZXNcbiAgU3RyaW5nTnVtYmVyc1xuICBmcmV0Ym9hcmRfcG9zaXRpb25zX2VhY2hcbiAgcGl0Y2hfbnVtYmVyX2Zvcl9wb3NpdGlvblxufSA9IEZyZXRib2FyZE1vZGVsXG5cbnJlcXVpcmUgJy4vdXRpbHMnXG5cbiMgVGhlc2UgYXJlIFwiZmluZ2VyaW5nc1wiLCBub3QgXCJ2b2ljaW5nc1wiLCBiZWNhdXNlIHRoZXkgYWxzbyBpbmNsdWRlIGJhcnJlIGluZm9ybWF0aW9uLlxuY2xhc3MgRmluZ2VyaW5nXG4gIGNvbnN0cnVjdG9yOiAoe0Bwb3NpdGlvbnMsIEBjaG9yZCwgQGJhcnJlc30pIC0+XG4gICAgQHBvc2l0aW9ucy5zb3J0IChhLCBiKSAtPiBhLnN0cmluZyAtIGIuc3RyaW5nXG5cbiAgQGNhY2hlZF9nZXR0ZXIgJ2ZyZXRzdHJpbmcnLCAtPlxuICAgIGZyZXRfdmVjdG9yID0gKC0xIGZvciBzIGluIFN0cmluZ051bWJlcnMpXG4gICAgZnJldF92ZWN0b3Jbc3RyaW5nXSA9IGZyZXQgZm9yIHtzdHJpbmcsIGZyZXR9IGluIEBwb3NpdGlvbnNcbiAgICAoKGlmIHggPj0gMCB0aGVuIHggZWxzZSAneCcpIGZvciB4IGluIGZyZXRfdmVjdG9yKS5qb2luKCcnKVxuXG4gIEBjYWNoZWRfZ2V0dGVyICdpbnZlcnNpb24nLCAtPlxuICAgIEBjaG9yZC5waXRjaF9jbGFzc2VzLmluZGV4T2YgaW50ZXJ2YWxfY2xhc3NfYmV0d2VlbihAY2hvcmQucm9vdCwgcGl0Y2hfbnVtYmVyX2Zvcl9wb3NpdGlvbihAcG9zaXRpb25zWzBdKSlcblxuZmluZF9iYXJyZXMgPSAocG9zaXRpb25zKSAtPlxuICBmcmV0X3Jvd3MgPSBmb3IgZm4gaW4gRnJldE51bWJlcnNcbiAgICAoZm9yIHNuIGluIFN0cmluZ051bWJlcnNcbiAgICAgIGlmIF8uZmluZChwb3NpdGlvbnMsIChwb3MpLT4gcG9zLnN0cmluZyA9PSBzbiBhbmQgcG9zLmZyZXQgPiBmbilcbiAgICAgICAgJy4nXG4gICAgICBlbHNlIGlmIF8uZmluZChwb3NpdGlvbnMsIChwb3MpLT4gcG9zLnN0cmluZyA9PSBzbiBhbmQgcG9zLmZyZXQgPCBmbilcbiAgICAgICAgJy0nXG4gICAgICBlbHNlIGlmIF8uZmluZChwb3NpdGlvbnMsIChwb3MpIC0+IHBvcy5zdHJpbmcgPT0gc24gYW5kIHBvcy5mcmV0ID09IGZuKVxuICAgICAgICAneCdcbiAgICAgIGVsc2VcbiAgICAgICAgJyAnKS5qb2luKCcnKVxuICBiYXJyZXMgPSBbXVxuICBmb3IgZnAsIGZuIGluIGZyZXRfcm93c1xuICAgIGNvbnRpbnVlIGlmIGZuID09IDBcbiAgICBtID0gZnAubWF0Y2goL15bXnhdKih4W1xcLnhdK3hcXC4qKSQvKVxuICAgIGNvbnRpbnVlIHVubGVzcyBtXG4gICAgYmFycmVzLnB1c2hcbiAgICAgIGZyZXQ6IGZuXG4gICAgICBzdHJpbmc6IG1bMF0ubGVuZ3RoIC0gbVsxXS5sZW5ndGhcbiAgICAgIHN0cmluZ19jb3VudDogbVsxXS5sZW5ndGhcbiAgICAgIHN1YnN1bXB0aW9uX2NvdW50OiBtWzFdLm1hdGNoKC94L2cpLmxlbmd0aFxuICBiYXJyZXNcblxuZmluZF9iYXJyZV9zZXRzID0gKHBvc2l0aW9ucykgLT5cbiAgcG93ZXJzZXQgPSAoeHMpIC0+XG4gICAgcmV0dXJuIFtbXV0gdW5sZXNzIHhzLmxlbmd0aFxuICAgIFt4LCB4cy4uLl0gPSB4c1xuICAgIHRhaWwgPSBwb3dlcnNldCB4c1xuICAgIHRhaWwuY29uY2F0KFt4XS5jb25jYXQoeXMpIGZvciB5cyBpbiB0YWlsKVxuICBiYXJyZXMgPSBmaW5kX2JhcnJlcyBwb3NpdGlvbnNcbiAgcmV0dXJuIHBvd2Vyc2V0IGJhcnJlc1xuXG5maW5nZXJfcG9zaXRpb25zX29uX2Nob3JkID0gKGNob3JkKSAtPlxuICBwb3NpdGlvbnMgPSBbXVxuICBmcmV0Ym9hcmRfcG9zaXRpb25zX2VhY2ggKHBvcykgLT5cbiAgICBpbnRlcnZhbF9jbGFzcyA9IGludGVydmFsX2NsYXNzX2JldHdlZW4gY2hvcmQucm9vdCwgcGl0Y2hfbnVtYmVyX2Zvcl9wb3NpdGlvbihwb3MpXG4gICAgZGVncmVlX2luZGV4ID0gY2hvcmQucGl0Y2hfY2xhc3Nlcy5pbmRleE9mIGludGVydmFsX2NsYXNzXG4gICAgcG9zaXRpb25zLnB1c2gge3N0cmluZzogcG9zLnN0cmluZywgZnJldDogcG9zLmZyZXQsIGludGVydmFsX2NsYXNzLCBkZWdyZWVfaW5kZXh9IGlmIGRlZ3JlZV9pbmRleCA+PSAwXG4gIHBvc2l0aW9uc1xuXG4jIFRPRE8gYWRkIG9wdGlvbnMgZm9yIHN0cnVtbWluZyB2cy4gZmluZ2Vyc3R5bGU7IG11dGluZzsgc3BhblxuZmluZ2VyaW5nc19mb3IgPSAoY2hvcmQsIG9wdGlvbnM9e30pIC0+XG4gIG9wdGlvbnMgPSBfLmV4dGVuZCB7ZmlsdGVyOiB0cnVlfSwgb3B0aW9uc1xuICB3YXJuID0gZmFsc2VcbiAgdGhyb3cgbmV3IEVycm9yIFwiTm8gcm9vdCBmb3IgI3t1dGlsLmluc3BlY3QgY2hvcmR9XCIgdW5sZXNzIGNob3JkLnJvb3Q/XG5cblxuICAjXG4gICMgR2VuZXJhdGVcbiAgI1xuICBwb3NpdGlvbnMgPSBmaW5nZXJfcG9zaXRpb25zX29uX2Nob3JkKGNob3JkKVxuXG4gIGZyZXRzX3Blcl9zdHJpbmcgPSBkbyAoc3RyaW5ncz0oW10gZm9yIF9fIGluIE9wZW5TdHJpbmdQaXRjaGVzKSkgLT5cbiAgICBzdHJpbmdzW3Bvc2l0aW9uLnN0cmluZ10ucHVzaCBwb3NpdGlvbiBmb3IgcG9zaXRpb24gaW4gcG9zaXRpb25zXG4gICAgc3RyaW5nc1xuXG4gIGNvbGxlY3RfZmluZ2VyaW5nX3Bvc2l0aW9ucyA9IChzdHJpbmdfZnJldHMpIC0+XG4gICAgcmV0dXJuIFtbXV0gdW5sZXNzIHN0cmluZ19mcmV0cy5sZW5ndGhcbiAgICBmcmV0cyA9IHN0cmluZ19mcmV0c1swXVxuICAgIGZvbGxvd2luZ19maW5nZXJfcG9zaXRpb25zID0gY29sbGVjdF9maW5nZXJpbmdfcG9zaXRpb25zKHN0cmluZ19mcmV0c1sxLi5dKVxuICAgIHJldHVybiBmb2xsb3dpbmdfZmluZ2VyX3Bvc2l0aW9ucy5jb25jYXQoKFtuXS5jb25jYXQocmlnaHQpIFxcXG4gICAgICBmb3IgbiBpbiBmcmV0cyBmb3IgcmlnaHQgaW4gZm9sbG93aW5nX2Zpbmdlcl9wb3NpdGlvbnMpLi4uKVxuXG4gIGdlbmVyYXRlX2ZpbmdlcmluZ3MgPSAtPlxuICAgIF8uZmxhdHRlbihuZXcgRmluZ2VyaW5nIHtwb3NpdGlvbnMsIGNob3JkLCBiYXJyZXN9IFxcXG4gICAgICBmb3IgYmFycmVzIGluIGZpbmRfYmFycmVfc2V0cyhwb3NpdGlvbnMpIFxcXG4gICAgICBmb3IgcG9zaXRpb25zIGluIGNvbGxlY3RfZmluZ2VyaW5nX3Bvc2l0aW9ucyhmcmV0c19wZXJfc3RyaW5nKSlcblxuICBjaG9yZF9ub3RlX2NvdW50ID0gY2hvcmQucGl0Y2hfY2xhc3Nlcy5sZW5ndGhcblxuXG4gICNcbiAgIyBGaWx0ZXJzXG4gICNcblxuICBjb3VudF9kaXN0aW5jdF9ub3RlcyA9IChmaW5nZXJpbmcpIC0+XG4gICAgXy5jaGFpbihmaW5nZXJpbmcucG9zaXRpb25zKS5wbHVjaygnaW50ZXJ2YWxfY2xhc3MnKS51bmlxKCkudmFsdWUoKS5sZW5ndGhcblxuICBoYXNfYWxsX25vdGVzID0gKGZpbmdlcmluZykgLT5cbiAgICByZXR1cm4gY291bnRfZGlzdGluY3Rfbm90ZXMoZmluZ2VyaW5nKSA9PSBjaG9yZF9ub3RlX2NvdW50XG5cbiAgbXV0ZWRfbWVkaWFsX3N0cmluZ3MgPSAoZmluZ2VyaW5nKSAtPlxuICAgIHJldHVybiBmaW5nZXJpbmcuZnJldHN0cmluZy5tYXRjaCgvXFxkeCtcXGQvKVxuXG4gIG11dGVkX3RyZWJsZV9zdHJpbmdzID0gKGZpbmdlcmluZykgLT5cbiAgICByZXR1cm4gZmluZ2VyaW5nLmZyZXRzdHJpbmcubWF0Y2goL3gkLylcblxuICBmaW5nZXJfY291bnQgPSAoZmluZ2VyaW5nKSAtPlxuICAgIG4gPSAocG9zIGZvciBwb3MgaW4gZmluZ2VyaW5nLnBvc2l0aW9ucyB3aGVuIHBvcy5mcmV0ID4gMCkubGVuZ3RoXG4gICAgbiAtPSBiYXJyZS5zdWJzdW1wdGlvbl9jb3VudCBmb3IgYmFycmUgaW4gZmluZ2VyaW5nLmJhcnJlc1xuICAgIG5cblxuICBmb3VyX2ZpbmdlcnNfb3JfZmV3ZXIgPSAoZmluZ2VyaW5nKSAtPlxuICAgIHJldHVybiBmaW5nZXJfY291bnQoZmluZ2VyaW5nKSA8PSA0XG5cbiAgY21wID0gKGZuKSAtPiAoeC4uLikgLT4gIWZuKHguLi4pXG5cbiAgIyBDb25zdHJ1Y3QgdGhlIGZpbHRlciBzZXRcblxuICBmaWx0ZXJzID0gW11cbiAgZmlsdGVycy5wdXNoIG5hbWU6ICdoYXMgYWxsIGNob3JkIG5vdGVzJywgc2VsZWN0OiBoYXNfYWxsX25vdGVzXG5cbiAgaWYgb3B0aW9ucy5maWx0ZXJcbiAgICBmaWx0ZXJzLnB1c2ggbmFtZTogJ2ZvdXIgZmluZ2VycyBvciBmZXdlcicsIHNlbGVjdDogZm91cl9maW5nZXJzX29yX2Zld2VyXG5cbiAgdW5sZXNzIG9wdGlvbnMuZmluZ2VycGlja2luZ1xuICAgIGZpbHRlcnMucHVzaCBuYW1lOiAnbm8gbXV0ZWQgbWVkaWFsIHN0cmluZ3MnLCByZWplY3Q6IG11dGVkX21lZGlhbF9zdHJpbmdzXG4gICAgZmlsdGVycy5wdXNoIG5hbWU6ICdubyBtdXRlZCB0cmVibGUgc3RyaW5ncycsIHJlamVjdDogbXV0ZWRfdHJlYmxlX3N0cmluZ3NcblxuICAjIGZpbHRlciBieSBhbGwgdGhlIGZpbHRlcnMgaW4gdGhlIGxpc3QsIGV4Y2VwdCBpZ25vcmUgdGhvc2UgdGhhdCB3b3VsZG4ndCBwYXNzIGFueXRoaW5nXG4gIGZpbHRlcl9maW5nZXJpbmdzID0gKGZpbmdlcmluZ3MpIC0+XG4gICAgZm9yIHtuYW1lLCBzZWxlY3QsIHJlamVjdH0gaW4gZmlsdGVyc1xuICAgICAgc2VsZWN0IHx8PSBjbXAocmVqZWN0KVxuICAgICAgZmlsdGVyZWQgPSAoZmluZ2VyaW5nIGZvciBmaW5nZXJpbmcgaW4gZmluZ2VyaW5ncyB3aGVuIHNlbGVjdCBmaW5nZXJpbmcpXG4gICAgICB1bmxlc3MgZmlsdGVyZWQubGVuZ3RoXG4gICAgICAgIGNvbnNvbGUud2FybiBcIiN7Y2hvcmRfbmFtZX06IG5vIGZpbmdlcmluZ3MgcGFzcyBmaWx0ZXIgXFxcIiN7bmFtZX1cXFwiXCIgaWYgd2FyblxuICAgICAgICBmaWx0ZXJlZCA9IGZpbmdlcmluZ3NcbiAgICAgIGZpbmdlcmluZ3MgPSBmaWx0ZXJlZFxuICAgIHJldHVybiBmaW5nZXJpbmdzXG5cblxuICAjXG4gICMgU29ydFxuICAjXG5cbiAgIyBGSVhNRSBjb3VudCBwaXRjaCBjbGFzc2VzLCBub3Qgc291bmRlZCBzdHJpbmdzXG4gIGhpZ2hfbm90ZV9jb3VudCA9IChmaW5nZXJpbmcpIC0+XG4gICAgZmluZ2VyaW5nLnBvc2l0aW9ucy5sZW5ndGhcblxuICBpc19yb290X3Bvc2l0aW9uID0gKGZpbmdlcmluZykgLT5cbiAgICBfKGZpbmdlcmluZy5wb3NpdGlvbnMpLnNvcnRCeSgocG9zKSAtPiBwb3Muc3RyaW5nKVswXS5kZWdyZWVfaW5kZXggPT0gMFxuXG4gIHJldmVyc2Vfc29ydF9rZXkgPSAoZm4pIC0+IChhKSAtPiAtZm4oYSlcblxuICAjIG9yZGVyZWQgbGlzdCBvZiBwcmVmZXJlbmNlcywgZnJvbSBtb3N0IHRvIGxlYXN0IGltcG9ydGFudFxuICBwcmVmZXJlbmNlcyA9IFtcbiAgICB7bmFtZTogJ3Jvb3QgcG9zaXRpb24nLCBrZXk6IGlzX3Jvb3RfcG9zaXRpb259XG4gICAge25hbWU6ICdoaWdoIG5vdGUgY291bnQnLCBrZXk6IGhpZ2hfbm90ZV9jb3VudH1cbiAgICB7bmFtZTogJ2F2b2lkIGJhcnJlcycsIGtleTogcmV2ZXJzZV9zb3J0X2tleSgoZmluZ2VyaW5nKSAtPiBmaW5nZXJpbmcuYmFycmVzLmxlbmd0aCl9XG4gICAge25hbWU6ICdsb3cgZmluZ2VyIGNvdW50Jywga2V5OiByZXZlcnNlX3NvcnRfa2V5KGZpbmdlcl9jb3VudCl9XG4gIF1cblxuICBzb3J0X2ZpbmdlcmluZ3MgPSAoZmluZ2VyaW5ncykgLT5cbiAgICBmaW5nZXJpbmdzID0gXyhmaW5nZXJpbmdzKS5zb3J0Qnkoa2V5KSBmb3Ige2tleX0gaW4gcHJlZmVyZW5jZXMuc2xpY2UoMCkucmV2ZXJzZSgpXG4gICAgZmluZ2VyaW5ncy5yZXZlcnNlKClcbiAgICByZXR1cm4gZmluZ2VyaW5nc1xuXG5cbiAgI1xuICAjIEdlbmVyYXRlLCBmaWx0ZXIsIGFuZCBzb3J0XG4gICNcblxuICBjaG9yZF9uYW1lID0gY2hvcmQubmFtZVxuICBmaW5nZXJpbmdzID0gZ2VuZXJhdGVfZmluZ2VyaW5ncygpXG4gIGZpbmdlcmluZ3MgPSBmaWx0ZXJfZmluZ2VyaW5ncyBmaW5nZXJpbmdzXG4gIGZpbmdlcmluZ3MgPSBzb3J0X2ZpbmdlcmluZ3MgZmluZ2VyaW5nc1xuXG4gIHJldHVybiBmaW5nZXJpbmdzXG5cbmJlc3RfZmluZ2VyaW5nX2ZvciA9IChjaG9yZCkgLT5cbiAgcmV0dXJuIGZpbmdlcmluZ3NfZm9yKGNob3JkKVswXVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYmVzdF9maW5nZXJpbmdfZm9yXG4gIGZpbmdlcmluZ3NfZm9yXG4gIGZpbmdlcl9wb3NpdGlvbnNfb25fY2hvcmRcbn1cbiIsIntpbnRlcnZhbF9jbGFzc19iZXR3ZWVufSA9IHJlcXVpcmUoJy4vdGhlb3J5JylcblxuI1xuIyBGcmV0Ym9hcmRcbiNcblxuU3RyaW5nTnVtYmVycyA9IFswLi41XVxuU3RyaW5nQ291bnQgPSBTdHJpbmdOdW1iZXJzLmxlbmd0aFxuXG5GcmV0TnVtYmVycyA9IFswLi40XSAgIyBpbmNsdWRlcyBudXRcbkZyZXRDb3VudCA9IEZyZXROdW1iZXJzLmxlbmd0aCAtIDEgICMgZG9lc24ndCBpbmNsdWRlIG51dFxuXG5TdHJpbmdJbnRlcnZhbHMgPSBbNSwgNSwgNSwgNCwgNV1cblxuT3BlblN0cmluZ1BpdGNoZXMgPSBkbyAobnVtYmVycz1bXSkgLT5cbiAgbnVtYmVycy5wdXNoIDIwXG4gIGZvciBpbnRlcnZhbCwgaSBpbiBTdHJpbmdJbnRlcnZhbHNcbiAgICBudW1iZXJzLnB1c2ggbnVtYmVyc1tpXSArIGludGVydmFsXG4gIG51bWJlcnNcblxucGl0Y2hfbnVtYmVyX2Zvcl9wb3NpdGlvbiA9ICh7c3RyaW5nLCBmcmV0fSkgLT5cbiAgT3BlblN0cmluZ1BpdGNoZXNbc3RyaW5nXSArIGZyZXRcblxuZnJldGJvYXJkX3Bvc2l0aW9uc19lYWNoID0gKGZuKSAtPlxuICBmb3Igc3RyaW5nIGluIFN0cmluZ051bWJlcnNcbiAgICBmb3IgZnJldCBpbiBGcmV0TnVtYmVyc1xuICAgICAgZm4gc3RyaW5nOiBzdHJpbmcsIGZyZXQ6IGZyZXRcblxuaW50ZXJ2YWxzX2Zyb20gPSAocm9vdF9wb3NpdGlvbiwgc2VtaXRvbmVzKSAtPlxuICByb290X25vdGVfbnVtYmVyID0gcGl0Y2hfbnVtYmVyX2Zvcl9wb3NpdGlvbihyb290X3Bvc2l0aW9uKVxuICBwb3NpdGlvbnMgPSBbXVxuICBmcmV0Ym9hcmRfcG9zaXRpb25zX2VhY2ggKGZpbmdlcl9wb3NpdGlvbikgLT5cbiAgICByZXR1cm4gdW5sZXNzIGludGVydmFsX2NsYXNzX2JldHdlZW4ocm9vdF9ub3RlX251bWJlciwgcGl0Y2hfbnVtYmVyX2Zvcl9wb3NpdGlvbihmaW5nZXJfcG9zaXRpb24pKSA9PSBzZW1pdG9uZXNcbiAgICBwb3NpdGlvbnMucHVzaCBmaW5nZXJfcG9zaXRpb25cbiAgcmV0dXJuIHBvc2l0aW9uc1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgU3RyaW5nTnVtYmVyc1xuICBTdHJpbmdDb3VudFxuICBGcmV0TnVtYmVyc1xuICBGcmV0Q291bnRcbiAgT3BlblN0cmluZ1BpdGNoZXNcbiAgZnJldGJvYXJkX3Bvc2l0aW9uc19lYWNoXG4gIHBpdGNoX251bWJlcl9mb3JfcG9zaXRpb25cbiAgaW50ZXJ2YWxzX2Zyb21cbn1cbiIsIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xue0ludGVydmFsTmFtZXN9ID0gcmVxdWlyZSAnLi90aGVvcnknXG57YmxvY2ssIGRyYXdfdGV4dCwgd2l0aF9ncmFwaGljc19jb250ZXh0LCB3aXRoX2FsaWdubWVudH0gPSByZXF1aXJlICcuL2xheW91dCdcbkNob3JkRGlhZ3JhbSA9IHJlcXVpcmUgJy4vY2hvcmRfZGlhZ3JhbSdcblxuRGVmYXVsdFN0eWxlID1cbiAgaW50ZXJ2YWxfY2xhc3NfY29sb3JzOiBDaG9yZERpYWdyYW0uZGVmYXVsdFN0eWxlLmludGVydmFsX2NsYXNzX2NvbG9yc1xuICByYWRpdXM6IDUwXG4gIGNlbnRlcjogdHJ1ZVxuICBmaWxsX2NlbGxzOiBmYWxzZVxuICBsYWJlbF9jZWxsczogZmFsc2VcblxuIyBFbnVtZXJhdGUgdGhlc2UgZXhwbGljaXRseSBpbnN0ZWFkIG9mIGNvbXB1dGluZyB0aGVtLFxuIyBzbyB0aGF0IHdlIGNhbiBmaW5lLXR1bmUgdGhlIHBvc2l0aW9uIG9mIGNlbGxzIHRoYXRcbiMgY291bGQgYmUgcGxhY2VkIGF0IG9uZSBvZiBzZXZlcmFsIGRpZmZlcmVudCBsb2NhdGlvbnMuXG5JbnRlcnZhbFZlY3RvcnMgPVxuICAyOiB7UDU6IC0xLCBtMzogLTF9XG4gIDM6IHttMzogMX1cbiAgNDoge00zOiAxfVxuICA1OiB7UDU6IC0xfVxuICA2OiB7bTM6IDJ9XG4gIDExOiB7UDU6IDEsIE0zOiAxfVxuXG4jIFJldHVybnMgYSByZWNvcmQge20zIE0zIFA1fSB0aGF0IHJlcHJlc2VudHMgdGhlIGNhbm9uaWNhbCB2ZWN0b3IgKGFjY29yZGluZyB0byBgSW50ZXJ2YWxWZWN0b3JzYClcbiMgb2YgdGhlIGludGVydmFsIGNsYXNzLlxuaW50ZXJ2YWxfY2xhc3NfdmVjdG9ycyA9IChpbnRlcnZhbF9jbGFzcykgLT5cbiAgb3JpZ2luYWxfaW50ZXJ2YWxfY2xhc3MgPSBpbnRlcnZhbF9jbGFzcyAjIGZvciBlcnJvciByZXBvcnRpbmdcbiAgYWRqdXN0bWVudHMgPSB7fVxuICBhZGp1c3QgPSAoZF9pYywgaW50ZXJ2YWxzKSAtPlxuICAgIGludGVydmFsX2NsYXNzICs9IGRfaWNcbiAgICBhZGp1c3RtZW50c1trXSA/PSAwIGZvciBrIG9mIGludGVydmFsc1xuICAgIGFkanVzdG1lbnRzW2tdICs9IHYgZm9yIGssIHYgb2YgaW50ZXJ2YWxzXG4gIGFkanVzdCAtMjQsIFA1OiA0LCBNMzogLTEgd2hpbGUgaW50ZXJ2YWxfY2xhc3MgPj0gMjRcbiAgYWRqdXN0IC0xMiwgTTM6IDMgd2hpbGUgaW50ZXJ2YWxfY2xhc3MgPj0gMTJcbiAgW3JlY29yZCwgc2lnbl0gPSBbSW50ZXJ2YWxWZWN0b3JzW2ludGVydmFsX2NsYXNzXSwgMV1cbiAgW3JlY29yZCwgc2lnbl0gPSBbSW50ZXJ2YWxWZWN0b3JzWzEyIC0gaW50ZXJ2YWxfY2xhc3NdLCAtMV0gdW5sZXNzIHJlY29yZFxuICBpbnRlcnZhbHMgPSBfLmV4dGVuZCB7bTM6IDAsIE0zOiAwLCBQNTogMCwgc2lnbjogMX0sIHJlY29yZFxuICBpbnRlcnZhbHNba10gKj0gc2lnbiBmb3IgayBvZiBpbnRlcnZhbHNcbiAgaW50ZXJ2YWxzW2tdICs9IHYgZm9yIGssIHYgb2YgYWRqdXN0bWVudHNcbiAgY29tcHV0ZWRfc2VtaXRvbmVzID0gKDEyICsgaW50ZXJ2YWxzLlA1ICogNyArIGludGVydmFscy5NMyAqIDQgKyBpbnRlcnZhbHMubTMgKiAzKSAlIDEyXG4gIHVubGVzcyBjb21wdXRlZF9zZW1pdG9uZXMgPT0gb3JpZ2luYWxfaW50ZXJ2YWxfY2xhc3MgJSAxMlxuICAgIGNvbnNvbGUuZXJyb3IgXCJFcnJvciBjb21wdXRpbmcgZ3JpZCBwb3NpdGlvbiBmb3IgI3tvcmlnaW5hbF9pbnRlcnZhbF9jbGFzc306XFxuXCJcbiAgICAgICwgXCIgICN7b3JpZ2luYWxfaW50ZXJ2YWxfY2xhc3N9IC0+XCIsIGludGVydmFsc1xuICAgICAgLCAnLT4nLCBjb21wdXRlZF9zZW1pdG9uZXNcbiAgICAgICwgJyE9Jywgb3JpZ2luYWxfaW50ZXJ2YWxfY2xhc3MgJSAxMlxuICBpbnRlcnZhbHNcblxuZHJhd19oYXJtb25pY190YWJsZSA9IChpbnRlcnZhbF9jbGFzc2VzLCBvcHRpb25zPXt9KSAtPlxuICBvcHRpb25zID0gXy5leHRlbmQge2RyYXc6IHRydWV9LCBEZWZhdWx0U3R5bGUsIG9wdGlvbnNcbiAgY29sb3JzID0gb3B0aW9ucy5pbnRlcnZhbF9jbGFzc19jb2xvcnNcbiAgaW50ZXJ2YWxfY2xhc3NlcyA9IFswXS5jb25jYXQgaW50ZXJ2YWxfY2xhc3NlcyB1bmxlc3MgMCBpbiBpbnRlcnZhbF9jbGFzc2VzXG4gIGNlbGxfcmFkaXVzID0gb3B0aW9ucy5yYWRpdXNcbiAgaGV4X3JhZGl1cyA9IGNlbGxfcmFkaXVzIC8gMlxuXG4gIGNlbGxfY2VudGVyID0gKGludGVydmFsX2tsYXNzKSAtPlxuICAgIHZlY3RvcnMgPSBpbnRlcnZhbF9jbGFzc192ZWN0b3JzIGludGVydmFsX2tsYXNzXG4gICAgZHkgPSB2ZWN0b3JzLlA1ICsgKHZlY3RvcnMuTTMgKyB2ZWN0b3JzLm0zKSAvIDJcbiAgICBkeCA9IHZlY3RvcnMuTTMgLSB2ZWN0b3JzLm0zXG4gICAgeCA9IGR4ICogY2VsbF9yYWRpdXMgKiAuOFxuICAgIHkgPSAtZHkgKiBjZWxsX3JhZGl1cyAqIC45NVxuICAgIHt4LCB5fVxuXG4gIGJvdW5kcyA9IHtsZWZ0OiBJbmZpbml0eSwgdG9wOiBJbmZpbml0eSwgcmlnaHQ6IC1JbmZpbml0eSwgYm90dG9tOiAtSW5maW5pdHl9XG4gIGZvciBpbnRlcnZhbF9rbGFzcyBpbiBpbnRlcnZhbF9jbGFzc2VzXG4gICAge3gsIHl9ID0gY2VsbF9jZW50ZXIgaW50ZXJ2YWxfa2xhc3NcbiAgICBib3VuZHMubGVmdCA9IE1hdGgubWluIGJvdW5kcy5sZWZ0LCB4IC0gaGV4X3JhZGl1c1xuICAgIGJvdW5kcy50b3AgPSBNYXRoLm1pbiBib3VuZHMudG9wLCB5IC0gaGV4X3JhZGl1c1xuICAgIGJvdW5kcy5yaWdodCA9IE1hdGgubWF4IGJvdW5kcy5yaWdodCwgeCArIGhleF9yYWRpdXNcbiAgICBib3VuZHMuYm90dG9tID0gTWF0aC5tYXggYm91bmRzLmJvdHRvbSwgeSArIGhleF9yYWRpdXNcblxuICByZXR1cm4ge3dpZHRoOiBib3VuZHMucmlnaHQgLSBib3VuZHMubGVmdCwgaGVpZ2h0OiBib3VuZHMuYm90dG9tIC0gYm91bmRzLnRvcH0gdW5sZXNzIG9wdGlvbnMuZHJhd1xuXG4gIHdpdGhfZ3JhcGhpY3NfY29udGV4dCAoY3R4KSAtPlxuICAgIGN0eC50cmFuc2xhdGUgLWJvdW5kcy5sZWZ0LCAtYm91bmRzLmJvdHRvbVxuXG4gICAgZm9yIGludGVydmFsX2tsYXNzIGluIGludGVydmFsX2NsYXNzZXNcbiAgICAgIGlzX3Jvb3QgPSBpbnRlcnZhbF9rbGFzcyA9PSAwXG4gICAgICBjb2xvciA9IGNvbG9yc1tpbnRlcnZhbF9rbGFzcyAlIDEyXVxuICAgICAgY29sb3IgfHw9IGNvbG9yc1sxMiAtIGludGVydmFsX2tsYXNzXVxuICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICB7eCwgeX0gPSBjZWxsX2NlbnRlciBpbnRlcnZhbF9rbGFzc1xuXG4gICAgICAjIGZyYW1lXG4gICAgICBmb3IgaSBpbiBbMC4uNl1cbiAgICAgICAgYSA9IGkgKiBNYXRoLlBJIC8gM1xuICAgICAgICBwb3MgPSBbeCArIGhleF9yYWRpdXMgKiBNYXRoLmNvcyhhKSwgeSArIGhleF9yYWRpdXMgKiBNYXRoLnNpbihhKV1cbiAgICAgICAgY3R4Lm1vdmVUbyBwb3MuLi4gaWYgaSA9PSAwXG4gICAgICAgIGN0eC5saW5lVG8gcG9zLi4uXG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JheSdcbiAgICAgIGN0eC5zdHJva2UoKVxuXG4gICAgICAjIGZpbGxcbiAgICAgIGlmIGlzX3Jvb3Qgb3IgKG9wdGlvbnMuZmlsbF9jZWxscyBhbmQgaW50ZXJ2YWxfa2xhc3MgPCAxMilcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yIG9yICdyZ2JhKDI1NSwwLDAsMC4xNSknXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDAuMyB1bmxlc3MgaXNfcm9vdFxuICAgICAgICBjdHguZmlsbCgpXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDFcblxuICAgICAgY29udGludWUgaWYgaXNfcm9vdCBvciBvcHRpb25zLmZpbGxfY2VsbHNcblxuICAgICAgIyBmaWxsXG4gICAgICBjdHguZ2xvYmFsQWxwaGEgPSAwLjMgaWYgb3B0aW9ucy5sYWJlbF9jZWxsc1xuICAgICAgZG8gLT5cbiAgICAgICAgW2R4LCBkeSwgZG5dID0gWy15LCB4LCAyIC8gTWF0aC5zcXJ0KHgqeCArIHkqeSldXG4gICAgICAgIGR4ICo9IGRuXG4gICAgICAgIGR5ICo9IGRuXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgICBjdHgubW92ZVRvIDAsIDBcbiAgICAgICAgY3R4LmxpbmVUbyB4ICsgZHgsIHkgKyBkeVxuICAgICAgICBjdHgubGluZVRvIHggLSBkeCwgeSAtIGR5XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvclxuICAgICAgICBjdHguZmlsbCgpXG5cbiAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgY3R4LmFyYyB4LCB5LCAyLCAwLCAyICogTWF0aC5QSSwgZmFsc2VcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvclxuICAgICAgY3R4LmZpbGwoKVxuICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMVxuXG4gICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgY3R4LmFyYyAwLCAwLCAyLjUsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZVxuICAgIGN0eC5maWxsU3R5bGUgPSAncmVkJ1xuICAgIGN0eC5maWxsKClcblxuICAgIGlmIG9wdGlvbnMubGFiZWxfY2VsbHNcbiAgICAgIGZvciBpbnRlcnZhbF9rbGFzcyBpbiBpbnRlcnZhbF9jbGFzc2VzXG4gICAgICAgIGxhYmVsID0gSW50ZXJ2YWxOYW1lc1tpbnRlcnZhbF9rbGFzc11cbiAgICAgICAgbGFiZWwgPSAnUicgaWYgaW50ZXJ2YWxfa2xhc3MgPT0gMFxuICAgICAgICB7eCwgeX0gPSBjZWxsX2NlbnRlciBpbnRlcnZhbF9rbGFzc1xuICAgICAgICBkcmF3X3RleHQgbGFiZWwsIGZvbnQ6ICcxMHB0IFRpbWVzJywgZmlsbFN0eWxlOiAnYmxhY2snLCB4OiB4LCB5OiB5LCBncmF2aXR5OiAnY2VudGVyJ1xuXG5oYXJtb25pY190YWJsZV9ibG9jayA9ICh0b25lcywgb3B0aW9ucykgLT5cbiAgZGltZW5zaW9ucyA9IGRyYXdfaGFybW9uaWNfdGFibGUgdG9uZXMsIF8uZXh0ZW5kKHt9LCBvcHRpb25zLCBjb21wdXRlX2JvdW5kczogdHJ1ZSwgZHJhdzogZmFsc2UpXG4gIGJsb2NrXG4gICAgd2lkdGg6IGRpbWVuc2lvbnMud2lkdGhcbiAgICBoZWlnaHQ6IGRpbWVuc2lvbnMuaGVpZ2h0XG4gICAgZHJhdzogLT5cbiAgICAgIGRyYXdfaGFybW9uaWNfdGFibGUgdG9uZXMsIG9wdGlvbnNcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRyYXc6IGRyYXdfaGFybW9uaWNfdGFibGVcbiAgYmxvY2s6IGhhcm1vbmljX3RhYmxlX2Jsb2NrXG59XG4iLCJmcyA9IHJlcXVpcmUgJ2ZzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG51dGlsID0gcmVxdWlyZSAndXRpbCdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xuQ2FudmFzID0gcmVxdWlyZSAnY2FudmFzJ1xuXG5cbiNcbiMgRHJhd2luZ1xuI1xuXG5Db250ZXh0ID1cbiAgY2FudmFzOiBudWxsXG4gIGN0eDogbnVsbFxuXG5lcmFzZV9iYWNrZ3JvdW5kID0gLT5cbiAge2NhbnZhcywgY3R4fSA9IENvbnRleHRcbiAgY3R4LmZpbGxTdHlsZSA9ICd3aGl0ZSdcbiAgY3R4LmZpbGxSZWN0IDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodFxuXG5tZWFzdXJlX3RleHQgPSAodGV4dCwge2ZvbnR9PXt9KSAtPlxuICBjdHggPSBDb250ZXh0LmN0eFxuICBjdHguZm9udCA9IGZvbnQgaWYgZm9udFxuICBjdHgubWVhc3VyZVRleHQgdGV4dFxuXG5kcmF3X3RleHQgPSAodGV4dCwgb3B0aW9ucz17fSkgLT5cbiAgY3R4ID0gQ29udGV4dC5jdHhcbiAgb3B0aW9ucyA9IHRleHQgaWYgXy5pc09iamVjdCB0ZXh0XG4gIHtmb250LCBmaWxsU3R5bGUsIHgsIHksIGdyYXZpdHksIHdpZHRofSA9IG9wdGlvbnNcbiAgZ3Jhdml0eSB8fD0gJydcbiAgaWYgb3B0aW9ucy5jaG9pY2VzXG4gICAgZm9yIGNob2ljZSBpbiBvcHRpb25zLmNob2ljZXNcbiAgICAgIHRleHQgPSBjaG9pY2UgaWYgXy5pc1N0cmluZyBjaG9pY2VcbiAgICAgIHtmb250fSA9IGNob2ljZSBpZiBfLmlzT2JqZWN0IGNob2ljZVxuICAgICAgYnJlYWsgaWYgbWVhc3VyZV90ZXh0KHRleHQsIGZvbnQ6IGZvbnQpLndpZHRoIDw9IG9wdGlvbnMud2lkdGhcbiAgY3R4LmZvbnQgPSBmb250IGlmIGZvbnRcbiAgY3R4LmZpbGxTdHlsZSA9IGZpbGxTdHlsZSBpZiBmaWxsU3R5bGVcbiAgbSA9IGN0eC5tZWFzdXJlVGV4dCB0ZXh0XG4gIHggfHw9IDBcbiAgeSB8fD0gMFxuICB4IC09IG0ud2lkdGggLyAyIGlmIGdyYXZpdHkubWF0Y2goL14odG9wfGNlbnRlcnxtaWRkbGV8Y2VudGVyYm90dG9tKSQvaSlcbiAgeCAtPSBtLndpZHRoIGlmIGdyYXZpdHkubWF0Y2goL14ocmlnaHR8dG9wUmlnaHR8Ym90UmlnaHQpJC9pKVxuICB5IC09IG0uZW1IZWlnaHREZXNjZW50IGlmIGdyYXZpdHkubWF0Y2goL14oYm90dG9tfGJvdExlZnR8Ym90UmlnaHQpJC9pKVxuICB5ICs9IG0uZW1IZWlnaHRBc2NlbnQgaWYgZ3Jhdml0eS5tYXRjaCgvXih0b3B8dG9wTGVmdHx0b3BSaWdodCkkL2kpXG4gIGN0eC5maWxsVGV4dCB0ZXh0LCB4LCB5XG5cbndpdGhfY2FudmFzID0gKGNhbnZhcywgY2IpIC0+XG4gIHNhdmVkQ2FudmFzID0gQ29udGV4dC5jYW52YXNcbiAgc2F2ZWRDb250ZXh0ID0gQ29udGV4dC5jb250ZXh0XG4gIHRyeVxuICAgIENvbnRleHQuY2FudmFzID0gY2FudmFzXG4gICAgQ29udGV4dC5jdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICAgIHJldHVybiBjYigpXG4gIGZpbmFsbHlcbiAgICBDb250ZXh0LmNhbnZhcyA9IHNhdmVkQ2FudmFzXG4gICAgQ29udGV4dC5jb250ZXh0ID0gc2F2ZWRDb250ZXh0XG5cbndpdGhfZ3JhcGhpY3NfY29udGV4dCA9IChmbikgLT5cbiAgY3R4ID0gQ29udGV4dC5jdHhcbiAgY3R4LnNhdmUoKVxuICB0cnlcbiAgICBmbiBjdHhcbiAgZmluYWxseVxuICAgIGN0eC5yZXN0b3JlKClcblxuXG4jXG4jIEJveC1iYXNlZCBEZWNsYXJhdGl2ZSBMYXlvdXRcbiNcblxuYm94ID0gKHBhcmFtcykgLT5cbiAgYm94ID0gXy5leHRlbmQge3dpZHRoOiAwfSwgcGFyYW1zXG4gIGJveC5oZWlnaHQgPz0gKGJveC5hc2NlbnQgPyAwKSArIChib3guZGVzY2VudCA/IDApXG4gIGJveC5hc2NlbnQgPz0gYm94LmhlaWdodCAtIChib3guZGVzY2VudCA/IDApXG4gIGJveC5kZXNjZW50ID89IGJveC5oZWlnaHQgLSBib3guYXNjZW50XG4gIGJveFxuXG5wYWRfYm94ID0gKGJveCwgb3B0aW9ucykgLT5cbiAgYm94LmhlaWdodCArPSBvcHRpb25zLmJvdHRvbSBpZiBvcHRpb25zLmJvdHRvbVxuICBib3guZGVzY2VudCA9ICgoYm94LmRlc2NlbnQgPyAwKSArIG9wdGlvbnMuYm90dG9tKSBpZiBvcHRpb25zLmJvdHRvbVxuICBib3hcblxudGV4dF9ib3ggPSAodGV4dCwgb3B0aW9ucykgLT5cbiAgb3B0aW9ucyA9IF8uZXh0ZW5kIHt9LCBvcHRpb25zLCBncmF2aXR5OiBmYWxzZVxuICBtZWFzdXJlID0gbWVhc3VyZV90ZXh0IHRleHQsIG9wdGlvbnNcbiAgYm94XG4gICAgd2lkdGg6IG1lYXN1cmUud2lkdGhcbiAgICBoZWlnaHQ6IG1lYXN1cmUuZW1IZWlnaHRBc2NlbnQgKyBtZWFzdXJlLmVtSGVpZ2h0RGVzY2VudFxuICAgIGRlc2NlbnQ6IG1lYXN1cmUuZW1IZWlnaHREZXNjZW50XG4gICAgZHJhdzogLT4gZHJhd190ZXh0IHRleHQsIG9wdGlvbnNcblxudmJveCA9IChib3hlcy4uLikgLT5cbiAgb3B0aW9ucyA9IHt9XG4gIG9wdGlvbnMgPSBib3hlcy5wb3AoKSB1bmxlc3MgYm94ZXNbYm94ZXMubGVuZ3RoIC0gMV0ud2lkdGg/XG4gIG9wdGlvbnMgPSBfLmV4dGVuZCB7YWxpZ246ICdsZWZ0J30sIG9wdGlvbnNcbiAgd2lkdGggPSBNYXRoLm1heCBfLnBsdWNrKGJveGVzLCAnd2lkdGgnKS4uLlxuICBoZWlnaHQgPSBfLnBsdWNrKGJveGVzLCAnaGVpZ2h0JykucmVkdWNlIChhLCBiKSAtPiBhICsgYlxuICBkZXNjZW50ID0gYm94ZXNbYm94ZXMubGVuZ3RoIC0gMV0uZGVzY2VudFxuICBpZiBvcHRpb25zLmJhc2VsaW5lXG4gICAgYm94ZXNfYmVsb3cgPSBib3hlc1tib3hlcy5pbmRleE9mKG9wdGlvbnMuYmFzZWxpbmUpKzEuLi5dXG4gICAgZGVzY2VudCA9IG9wdGlvbnMuYmFzZWxpbmUuZGVzY2VudCArIF8ucGx1Y2soYm94ZXNfYmVsb3csICdoZWlnaHQnKS5yZWR1Y2UgKChhLCBiKSAtPiBhICsgYiksIDBcbiAgYm94XG4gICAgd2lkdGg6IHdpZHRoXG4gICAgaGVpZ2h0OiBoZWlnaHRcbiAgICBkZXNjZW50OiBkZXNjZW50XG4gICAgZHJhdzogLT5cbiAgICAgIGR5ID0gLWhlaWdodFxuICAgICAgYm94ZXMuZm9yRWFjaCAoYjEpIC0+XG4gICAgICAgIHdpdGhfZ3JhcGhpY3NfY29udGV4dCAoY3R4KSAtPlxuICAgICAgICAgIGR4ID0gc3dpdGNoIG9wdGlvbnMuYWxpZ25cbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnIHRoZW4gMFxuICAgICAgICAgICAgd2hlbiAnY2VudGVyJyB0aGVuIE1hdGgubWF4IDAsICh3aWR0aCAtIGIxLndpZHRoKSAvIDJcbiAgICAgICAgICBjdHgudHJhbnNsYXRlIGR4LCBkeSArIGIxLmhlaWdodCAtIGIxLmRlc2NlbnRcbiAgICAgICAgICBiMS5kcmF3PyhjdHgpXG4gICAgICAgICAgZHkgKz0gYjEuaGVpZ2h0XG5cbmFib3ZlID0gdmJveFxuXG5oYm94ID0gKGIxLCBiMikgLT5cbiAgY29udGFpbmVyX3NpemUgPSBDdXJyZW50Qm9vaz8ucGFnZV9vcHRpb25zIG9yIEN1cnJlbnRQYWdlXG4gIGJveGVzID0gW2IxLCBiMl1cbiAgaGVpZ2h0ID0gTWF0aC5tYXggXy5wbHVjayhib3hlcywgJ2hlaWdodCcpLi4uXG4gIHdpZHRoID0gXy5wbHVjayhib3hlcywgJ3dpZHRoJykucmVkdWNlIChhLCBiKSAtPiBhICsgYlxuICB3aWR0aCA9IGNvbnRhaW5lcl9zaXplLndpZHRoIGlmIHdpZHRoID09IEluZmluaXR5XG4gIHNwcmluZ19jb3VudCA9IChiIGZvciBiIGluIGJveGVzIHdoZW4gYi53aWR0aCA9PSBJbmZpbml0eSkubGVuZ3RoXG4gIGJveFxuICAgIHdpZHRoOiB3aWR0aFxuICAgIGhlaWdodDogaGVpZ2h0XG4gICAgZHJhdzogLT5cbiAgICAgIHggPSAwXG4gICAgICBib3hlcy5mb3JFYWNoIChiKSAtPlxuICAgICAgICB3aXRoX2dyYXBoaWNzX2NvbnRleHQgKGN0eCkgLT5cbiAgICAgICAgICBjdHgudHJhbnNsYXRlIHgsIDBcbiAgICAgICAgICBiLmRyYXc/KGN0eClcbiAgICAgICAgaWYgYi53aWR0aCA9PSBJbmZpbml0eVxuICAgICAgICAgIHggKz0gKHdpZHRoIC0gKHdpZHRoIGZvciB7d2lkdGh9IGluIGJveGVzIHdoZW4gd2lkdGggIT0gSW5maW5pdHkpLnJlZHVjZSAoYSwgYikgLT4gYSArIGIpIC8gc3ByaW5nX2NvdW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICB4ICs9IGIud2lkdGhcblxub3ZlcmxheSA9IChib3hlcy4uLikgLT5cbiAgYm94XG4gICAgd2lkdGg6IE1hdGgubWF4IF8ucGx1Y2soYm94ZXMsICd3aWR0aCcpLi4uXG4gICAgaGVpZ2h0OiBNYXRoLm1heCBfLnBsdWNrKGJveGVzLCAnaGVpZ2h0JykuLi5cbiAgICBkcmF3OiAtPlxuICAgICAgZm9yIGIgaW4gYm94ZXNcbiAgICAgICAgd2l0aF9ncmFwaGljc19jb250ZXh0IChjdHgpIC0+XG4gICAgICAgICAgYi5kcmF3IGN0eFxuXG5sYWJlbGVkID0gKHRleHQsIG9wdGlvbnMsIGJveCkgLT5cbiAgW29wdGlvbnMsIGJveF0gPSBbe30sIG9wdGlvbnNdIGlmIGFyZ3VtZW50cy5sZW5ndGggPT0gMlxuICBkZWZhdWx0X29wdGlvbnMgPVxuICAgIGZvbnQ6ICcxMnB4IFRpbWVzJ1xuICAgIGZpbGxTdHlsZTogJ2JsYWNrJ1xuICBvcHRpb25zID0gXy5leHRlbmQgZGVmYXVsdF9vcHRpb25zLCBvcHRpb25zXG4gIGFib3ZlIHRleHRfYm94KHRleHQsIG9wdGlvbnMpLCBib3gsIG9wdGlvbnNcblxud2l0aF9ncmlkX2JveGVzID0gKG9wdGlvbnMsIGdlbmVyYXRvcikgLT5cbiAge21heCwgZmxvb3J9ID0gTWF0aFxuXG4gIG9wdGlvbnMgPSBfLmV4dGVuZCB7aGVhZGVyX2hlaWdodDogMCwgZ3V0dGVyX3dpZHRoOiAxMCwgZ3V0dGVyX2hlaWdodDogMTB9LCBvcHRpb25zXG4gIGNvbnRhaW5lcl9zaXplID0gQ3VycmVudEJvb2s/LnBhZ2Vfb3B0aW9ucyBvciBDdXJyZW50UGFnZVxuXG4gIGxpbmVfYnJlYWsgPSB7d2lkdGg6IDAsIGhlaWdodDogMCwgbGluZWJyZWFrOiB0cnVlfVxuICBoZWFkZXIgPSBudWxsXG4gIGNlbGxzID0gW11cbiAgZ2VuZXJhdG9yXG4gICAgaGVhZGVyOiAoYm94KSAtPiBoZWFkZXIgPSBib3hcbiAgICBzdGFydF9yb3c6ICgpIC0+IGNlbGxzLnB1c2ggbGluZV9icmVha1xuICAgIGNlbGw6IChib3gpIC0+IGNlbGxzLnB1c2ggYm94XG4gICAgY2VsbHM6IChib3hlcykgLT4gY2VsbHMucHVzaCBiIGZvciBiIGluIGJveGVzXG5cbiAgY2VsbF93aWR0aCA9IG1heCBfLnBsdWNrKGNlbGxzLCAnd2lkdGgnKS4uLlxuICBjZWxsX2hlaWdodCA9IG1heCBfLnBsdWNrKGNlbGxzLCAnaGVpZ2h0JykuLi5cbiAgIyBjZWxsLmRlc2NlbnQgPz0gMCBmb3IgY2VsbCBpbiBjZWxsc1xuXG4gIF8uZXh0ZW5kIG9wdGlvbnNcbiAgICAsIGhlYWRlcl9oZWlnaHQ6IGhlYWRlcj8uaGVpZ2h0IG9yIDBcbiAgICAsIGNlbGxfd2lkdGg6IGNlbGxfd2lkdGhcbiAgICAsIGNlbGxfaGVpZ2h0OiBjZWxsX2hlaWdodFxuICAgICwgY29sczogbWF4IDEsIGZsb29yKChjb250YWluZXJfc2l6ZS53aWR0aCArIG9wdGlvbnMuZ3V0dGVyX3dpZHRoKSAvIChjZWxsX3dpZHRoICsgb3B0aW9ucy5ndXR0ZXJfd2lkdGgpKVxuICBvcHRpb25zLnJvd3MgPSBkbyAtPlxuICAgIGNvbnRlbnRfaGVpZ2h0ID0gY29udGFpbmVyX3NpemUuaGVpZ2h0IC0gb3B0aW9ucy5oZWFkZXJfaGVpZ2h0XG4gICAgY2VsbF9oZWlnaHQgPSBjZWxsX2hlaWdodCArIG9wdGlvbnMuZ3V0dGVyX2hlaWdodFxuICAgIG1heCAxLCBmbG9vcigoY29udGVudF9oZWlnaHQgKyBvcHRpb25zLmd1dHRlcl9oZWlnaHQpIC8gY2VsbF9oZWlnaHQpXG5cbiAgY2VsbC5kZXNjZW50ID89IDAgZm9yIGNlbGwgaW4gY2VsbHNcbiAgbWF4X2Rlc2NlbnQgPSBtYXggXy5wbHVjayhjZWxscywgJ2Rlc2NlbnQnKS4uLlxuICAjIGNvbnNvbGUuaW5mbyAnZGVzY2VudCcsIG1heF9kZXNjZW50LCAnZnJvbScsIF8ucGx1Y2soY2VsbHMsICdkZXNjZW50JylcblxuICB3aXRoX2dyaWQgb3B0aW9ucywgKGdyaWQpIC0+XG4gICAgaWYgaGVhZGVyXG4gICAgICB3aXRoX2dyYXBoaWNzX2NvbnRleHQgKGN0eCkgLT5cbiAgICAgICAgY3R4LnRyYW5zbGF0ZSAwLCBoZWFkZXIuaGVpZ2h0IC0gaGVhZGVyLmRlc2NlbnRcbiAgICAgICAgaGVhZGVyPy5kcmF3IGN0eFxuICAgIGNlbGxzLmZvckVhY2ggKGNlbGwpIC0+XG4gICAgICBncmlkLnN0YXJ0X3JvdygpIGlmIGNlbGwubGluZWJyZWFrP1xuICAgICAgcmV0dXJuIGlmIGNlbGwgPT0gbGluZV9icmVha1xuICAgICAgZ3JpZC5hZGRfY2VsbCAtPlxuICAgICAgICB3aXRoX2dyYXBoaWNzX2NvbnRleHQgKGN0eCkgLT5cbiAgICAgICAgICBjdHgudHJhbnNsYXRlIDAsIGNlbGxfaGVpZ2h0IC0gY2VsbC5kZXNjZW50XG4gICAgICAgICAgY2VsbC5kcmF3IGN0eFxuXG5cbiNcbiMgRmlsZSBTYXZpbmdcbiNcblxuQnVpbGREaXJlY3RvcnkgPSAnLidcbkRlZmF1bHRGaWxlbmFtZSA9IG51bGxcblxuZGlyZWN0b3J5ID0gKHBhdGgpIC0+IEJ1aWxkRGlyZWN0b3J5ID0gcGF0aFxuZmlsZW5hbWUgPSAobmFtZSkgLT4gRGVmYXVsdEZpbGVuYW1lID0gbmFtZVxuXG5zYXZlX2NhbnZhc190b19wbmcgPSAoY2FudmFzLCBmbmFtZSkgLT5cbiAgb3V0ID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0ocGF0aC5qb2luKEJ1aWxkRGlyZWN0b3J5LCBmbmFtZSkpXG4gIHN0cmVhbSA9IGNhbnZhcy5wbmdTdHJlYW0oKVxuICBzdHJlYW0ub24gJ2RhdGEnLCAoY2h1bmspIC0+IG91dC53cml0ZShjaHVuaylcbiAgc3RyZWFtLm9uICdlbmQnLCAoKSAtPiBjb25zb2xlLmluZm8gXCJTYXZlZCAje2ZuYW1lfVwiXG5cblxuI1xuIyBQYXBlciBTaXplc1xuI1xuXG5QYXBlclNpemVzID1cbiAgZm9saW86ICcxMmluIHggMTVpbidcbiAgcXVhcnRvOiAnOS41aW4geCAxMmluJ1xuICBvY3Rhdm86ICc2aW4geCA5aW4nXG4gIGR1b2RlY2ltbzogJzVpbiB4IDcuMzc1aW4nXG4gICMgQU5TSSBzaXplc1xuICAnQU5TSSBBJzogJzguNWluIMOXIDExaW4nXG4gICdBTlNJIEInOiAnMTFpbiB4IDE3aW4nXG4gIGxldHRlcjogJ0FOU0kgQSdcbiAgbGVkZ2VyOiAnQU5TSSBCIGxhbmRzY2FwZSdcbiAgdGFibG9pZDogJ0FOU0kgQiBwb3J0cmFpdCdcbiAgJ0FOU0kgQyc6ICcxN2luIMOXIDIyaW4nXG4gICdBTlNJIEQnOiAnMjJpbiDDlyAzNGluJ1xuICAnQU5TSSBFJzogJzM0aW4gw5cgNDRpbidcblxuZ2V0X3BhZ2Vfc2l6ZV9kaW1lbnNpb25zID0gKHNpemUsIG9yaWVudGF0aW9uPW51bGwpIC0+XG4gIHBhcnNlTWVhc3VyZSA9IChtZWFzdXJlKSAtPlxuICAgIHJldHVybiBtZWFzdXJlIGlmIHR5cGVvZiBtZWFzdXJlID09ICdudW1iZXInXG4gICAgdW5sZXNzIG1lYXN1cmUubWF0Y2ggL14oXFxkKyg/OlxcLlxcZCopPylcXHMqKC4rKSQvXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJVbnJlY29nbml6ZWQgbWVhc3VyZSAje3V0aWwuaW5zcGVjdCBtZWFzdXJlfSBpbiAje3V0aWwuaW5zcGVjdCBzaXplfVwiXG4gICAgW24sIHVuaXRzXSA9IFtOdW1iZXIoUmVnRXhwLiQxKSwgUmVnRXhwLiQyXVxuICAgIHN3aXRjaCB1bml0c1xuICAgICAgd2hlbiBcIlwiIHRoZW4gblxuICAgICAgd2hlbiBcImluXCIgdGhlbiBuICogNzJcbiAgICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwiVW5yZWNvZ25pemVkIHVuaXRzICN7dXRpbC5pbnNwZWN0IHVuaXRzfSBpbiAje3V0aWwuaW5zcGVjdCBzaXplfVwiXG5cbiAge3dpZHRoLCBoZWlnaHR9ID0gc2l6ZVxuICB3aGlsZSBfLmlzU3RyaW5nKHNpemUpXG4gICAgW3NpemUsIG9yaWVudGF0aW9uXSA9IFtSZWdFeHAuJDEsIFJlZ0V4cC5SMl0gaWYgc2l6ZS5tYXRjaCAvXiguKylcXHMrKGxhbmRzY2FwZXxwb3J0cmFpdCkkL1xuICAgIGJyZWFrIHVubGVzcyBzaXplIG9mIFBhcGVyU2l6ZXNcbiAgICBzaXplID0gUGFwZXJTaXplc1tzaXplXVxuICAgIHt3aWR0aCwgaGVpZ2h0fSA9IHNpemVcbiAgaWYgXy5pc1N0cmluZyhzaXplKVxuICAgIHRocm93IG5ldyBFcnJvciBcIlVucmVjb2duaXplZCBib29rIHNpemUgZm9ybWF0ICN7dXRpbC5pbnNwZWN0IHNpemV9XCIgdW5sZXNzIHNpemUubWF0Y2ggL14oLis/KVxccypbeMOXXVxccyooLispJC9cbiAgICBbd2lkdGgsIGhlaWdodF0gPSBbUmVnRXhwLiQxLCBSZWdFeHAuJDJdXG5cbiAgW3dpZHRoLCBoZWlnaHRdID0gW3BhcnNlTWVhc3VyZSh3aWR0aCksIHBhcnNlTWVhc3VyZShoZWlnaHQpXVxuICBzd2l0Y2ggb3JpZW50YXRpb24gb3IgJydcbiAgICB3aGVuICdsYW5kc2NhcGUnIHRoZW4gW3dpZHRoLCBoZWlnaHRdID0gW2hlaWdodCwgd2lkdGhdIHVubGVzcyB3aWR0aCA+IGhlaWdodFxuICAgIHdoZW4gJ3BvcnRyYWl0JyB0aGVuIFt3aWR0aCwgaGVpZ2h0XSA9IFtoZWlnaHQsIHdpZHRoXSBpZiB3aWR0aCA+IGhlaWdodFxuICAgIHdoZW4gJycgdGhlbiBudWxsXG4gICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCJVbmtub3duIG9yaWVudGF0aW9uICN7dXRpbC5pbnNwZWN0IG9yaWVudGF0aW9ufVwiXG4gIHt3aWR0aCwgaGVpZ2h0fVxuXG5kbyAtPlxuICBmb3IgbmFtZSwgdmFsdWUgb2YgUGFwZXJTaXplc1xuICAgIFBhcGVyU2l6ZXNbbmFtZV0gPSBnZXRfcGFnZV9zaXplX2RpbWVuc2lvbnMgdmFsdWVcblxuXG4jXG4jIExheW91dFxuI1xuXG5DdXJyZW50UGFnZSA9IG51bGxcbkN1cnJlbnRCb29rID0gbnVsbFxuTW9kZSA9IG51bGxcblxuXy5taXhpblxuICBzdW06XG4gICAgZG8gKHBsdXM9KGEsYikgLT4gYStiKSAtPlxuICAgICAgKHhzKSAtPiBfLnJlZHVjZSh4cywgcGx1cywgMClcblxuVERMUkxheW91dCA9IChib3hlcykgLT5cbiAgcGFnZV93aWR0aCA9IEN1cnJlbnRQYWdlLndpZHRoIC0gQ3VycmVudFBhZ2UubGVmdF9tYXJnaW4gLSBDdXJyZW50UGFnZS50b3BfbWFyZ2luXG4gIGJveGVzID0gYm94ZXNbLi5dXG4gIGIuZGVzY2VudCA/PSAwIGZvciBiIGluIGJveGVzXG4gIGR5ID0gMFxuICB3aWR0aCA9IDBcbiAgd2hpbGUgYm94ZXMubGVuZ3RoXG4gICAgY29uc29sZS5pbmZvICduZXh0JywgYm94ZXMubGVuZ3RoXG4gICAgbGluZSA9IFtdXG4gICAgd2hpbGUgYm94ZXMubGVuZ3RoXG4gICAgICBiID0gYm94ZXNbMF1cbiAgICAgIGJyZWFrIGlmIHdpZHRoICsgYi53aWR0aCA+IHBhZ2Vfd2lkdGggYW5kIGxpbmUubGVuZ3RoID4gMFxuICAgICAgbGluZS5wdXNoIGJcbiAgICAgIGJveGVzLnNoaWZ0KClcbiAgICAgIHdpZHRoICs9IGIud2lkdGhcbiAgICBhc2NlbnQgPSBfLm1heChiLmhlaWdodCAtIGIuZGVzY2VudCBmb3IgYiBpbiBsaW5lKVxuICAgIGRlc2NlbnQgPSBfLmNoYWluKGxpbmUpLnBsdWNrKCdkZXNjZW50JykubWF4KClcbiAgICBkeCA9IDBcbiAgICBjb25zb2xlLmluZm8gJ2RyYXcnLCBsaW5lLmxlbmd0aFxuICAgIGZvciBiIGluIGxpbmVcbiAgICAgIHdpdGhfZ3JhcGhpY3NfY29udGV4dCAoY3R4KSAtPlxuICAgICAgICBjdHgudHJhbnNsYXRlIGR4LCBkeSArIGFzY2VudFxuICAgICAgICBjb25zb2xlLmluZm8gJ2RyYXcnLCBkeCwgZHkgKyBhc2NlbnQsIGIuZHJhd1xuICAgICAgICBiLmRyYXcgY3R4XG4gICAgICBkeCArPSBiLndpZHRoXG4gICAgZHkgKz0gYXNjZW50ICsgZGVzY2VudFxuXG53aXRoX3BhZ2UgPSAob3B0aW9ucywgZHJhd19wYWdlKSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgXCJBbHJlYWR5IGluc2lkZSBhIHBhZ2VcIiBpZiBDdXJyZW50UGFnZVxuICBkZWZhdWx0cyA9IHt3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCwgcGFnZV9tYXJnaW46IDEwfVxuICB7d2lkdGgsIGhlaWdodCwgcGFnZV9tYXJnaW59ID0gXy5leHRlbmQgZGVmYXVsdHMsIG9wdGlvbnNcbiAge2xlZnRfbWFyZ2luLCB0b3BfbWFyZ2luLCByaWdodF9tYXJnaW4sIGJvdHRvbV9tYXJnaW59ID0gb3B0aW9uc1xuICBsZWZ0X21hcmdpbiA/PSBwYWdlX21hcmdpblxuICB0b3BfbWFyZ2luID89IHBhZ2VfbWFyZ2luXG4gIHJpZ2h0X21hcmdpbiA/PSBwYWdlX21hcmdpblxuICBib3R0b21fbWFyZ2luID89IHBhZ2VfbWFyZ2luXG5cbiAgY2FudmFzID0gQ29udGV4dC5jYW52YXMgfHw9XG4gICAgbmV3IENhbnZhcyB3aWR0aCArIGxlZnRfbWFyZ2luICsgcmlnaHRfbWFyZ2luLCBoZWlnaHQgKyB0b3BfbWFyZ2luICsgYm90dG9tX21hcmdpbiwgTW9kZVxuICBjdHggPSBDb250ZXh0LmN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG4gIGN0eC50ZXh0RHJhd2luZ01vZGUgPSAnZ2x5cGgnIGlmIE1vZGUgPT0gJ3BkZidcbiAgYm94ZXMgPSBbXVxuXG4gIHRyeVxuICAgIHBhZ2UgPVxuICAgICAgbGVmdF9tYXJnaW46IGxlZnRfbWFyZ2luXG4gICAgICB0b3BfbWFyZ2luOiB0b3BfbWFyZ2luXG4gICAgICByaWdodF9tYXJnaW46IHJpZ2h0X21hcmdpblxuICAgICAgYm90dG9tX21hcmdpbjogYm90dG9tX21hcmdpblxuICAgICAgd2lkdGg6IGNhbnZhcy53aWR0aFxuICAgICAgaGVpZ2h0OiBjYW52YXMuaGVpZ2h0XG4gICAgICBjb250ZXh0OiBjdHhcbiAgICAgIGJveDogKG9wdGlvbnMpIC0+XG4gICAgICAgIGJveGVzLnB1c2ggYm94KG9wdGlvbnMpXG4gICAgQ3VycmVudFBhZ2UgPSBwYWdlXG5cbiAgICBlcmFzZV9iYWNrZ3JvdW5kKClcblxuICAgIHdpdGhfZ3JhcGhpY3NfY29udGV4dCAoY3R4KSAtPlxuICAgICAgY3R4LnRyYW5zbGF0ZSBsZWZ0X21hcmdpbiwgYm90dG9tX21hcmdpblxuICAgICAgQ3VycmVudEJvb2s/LmhlYWRlcj8gcGFnZVxuICAgICAgQ3VycmVudEJvb2s/LmZvb3Rlcj8gcGFnZVxuICAgICAgZHJhd19wYWdlPyBwYWdlXG4gICAgICBURExSTGF5b3V0IGJveGVzXG5cbiAgICBzd2l0Y2ggTW9kZVxuICAgICAgd2hlbiAncGRmJyB0aGVuIGN0eC5hZGRQYWdlKClcbiAgICAgIGVsc2VcbiAgICAgICAgZmlsZW5hbWUgPSBcIiN7RGVmYXVsdEZpbGVuYW1lIG9yICd0ZXN0J30ucG5nXCJcbiAgICAgICAgZnMud3JpdGVGaWxlIHBhdGguam9pbihCdWlsZERpcmVjdG9yeSwgZmlsZW5hbWUpLCBjYW52YXMudG9CdWZmZXIoKVxuICAgICAgICBjb25zb2xlLmluZm8gXCJTYXZlZCAje2ZpbGVuYW1lfVwiXG4gIGZpbmFsbHlcbiAgICBDdXJyZW50UGFnZSA9IG51bGxcblxud2l0aF9ncmlkID0gKG9wdGlvbnMsIGNiKSAtPlxuICBkZWZhdWx0cyA9IHtndXR0ZXJfd2lkdGg6IDEwLCBndXR0ZXJfaGVpZ2h0OiAxMCwgaGVhZGVyX2hlaWdodDogMH1cbiAgb3B0aW9ucyA9IF8uZXh0ZW5kIGRlZmF1bHRzLCBvcHRpb25zXG4gIHtjb2xzLCByb3dzLCBjZWxsX3dpZHRoLCBjZWxsX2hlaWdodCwgaGVhZGVyX2hlaWdodCwgZ3V0dGVyX3dpZHRoLCBndXR0ZXJfaGVpZ2h0fSA9IG9wdGlvbnNcbiAgb3B0aW9ucy53aWR0aCB8fD0gY29scyAqIGNlbGxfd2lkdGggKyAoY29scyAtIDEpICogZ3V0dGVyX3dpZHRoXG4gIG9wdGlvbnMuaGVpZ2h0IHx8PSAgaGVhZGVyX2hlaWdodCArIHJvd3MgKiBjZWxsX2hlaWdodCArIChyb3dzIC0gMSkgKiBndXR0ZXJfaGVpZ2h0XG4gIG92ZXJmbG93ID0gW11cbiAgd2l0aF9wYWdlIG9wdGlvbnMsIChwYWdlKSAtPlxuICAgIGNiXG4gICAgICBjb250ZXh0OiBwYWdlLmNvbnRleHRcbiAgICAgIHJvd3M6IHJvd3NcbiAgICAgIGNvbHM6IGNvbHNcbiAgICAgIHJvdzogMFxuICAgICAgY29sOiAwXG4gICAgICBhZGRfY2VsbDogKGRyYXdfZm4pIC0+XG4gICAgICAgIFtjb2wsIHJvd10gPSBbQGNvbCwgQHJvd11cbiAgICAgICAgaWYgcm93ID49IHJvd3NcbiAgICAgICAgICBvdmVyZmxvdy5wdXNoIHtjb2wsIHJvdywgZHJhd19mbn1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIHdpdGhfZ3JhcGhpY3NfY29udGV4dCAoY3R4KSAtPlxuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSBjb2wgKiAoY2VsbF93aWR0aCArIGd1dHRlcl93aWR0aCksIGhlYWRlcl9oZWlnaHQgKyByb3cgKiAoY2VsbF9oZWlnaHQgKyBndXR0ZXJfaGVpZ2h0KVxuICAgICAgICAgICAgZHJhd19mbigpXG4gICAgICAgIGNvbCArPSAxXG4gICAgICAgIFtjb2wsIHJvd10gPSBbMCwgcm93ICsgMV0gaWYgY29sID49IGNvbHNcbiAgICAgICAgW0Bjb2wsIEByb3ddID0gW2NvbCwgcm93XVxuICAgICAgc3RhcnRfcm93OiAtPlxuICAgICAgICBbQGNvbCwgQHJvd10gPSBbMCwgQHJvdyArIDFdIGlmIEBjb2wgPiAwXG4gIHdoaWxlIG92ZXJmbG93Lmxlbmd0aFxuICAgIGNlbGwucm93IC09IHJvd3MgZm9yIGNlbGwgaW4gb3ZlcmZsb3dcbiAgICB3aXRoX3BhZ2Ugb3B0aW9ucywgKHBhZ2UpIC0+XG4gICAgICBmb3Ige2NvbCwgcm93LCBkcmF3X2ZufSBpbiBfLnNlbGVjdChvdmVyZmxvdywgKGNlbGwpIC0+IGNlbGwucm93IDwgcm93cylcbiAgICAgICAgd2l0aF9ncmFwaGljc19jb250ZXh0IChjdHgpIC0+XG4gICAgICAgICAgY3R4LnRyYW5zbGF0ZSBjb2wgKiAoY2VsbF93aWR0aCArIGd1dHRlcl93aWR0aCksIGhlYWRlcl9oZWlnaHQgKyByb3cgKiAoY2VsbF9oZWlnaHQgKyBndXR0ZXJfaGVpZ2h0KVxuICAgICAgICAgIGRyYXdfZm4oKVxuICAgIG92ZXJmbG93ID0gKGNlbGwgZm9yIGNlbGwgaW4gb3ZlcmZsb3cgd2hlbiBjZWxsLnJvdyA+PSByb3dzKVxuXG53aXRoX2Jvb2sgPSAoZmlsZW5hbWUsIG9wdGlvbnMsIGNiKSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgXCJ3aXRoX2Jvb2sgY2FsbGVkIHJlY3Vyc2l2ZWx5XCIgaWYgQ3VycmVudEJvb2tcbiAgW29wdGlvbnMsIGNiXSA9IFt7fSwgb3B0aW9uc10gaWYgXy5pc0Z1bmN0aW9uKG9wdGlvbnMpXG4gIHBhZ2VfbGltaXQgPSBvcHRpb25zLnBhZ2VfbGltaXRcbiAgcGFnZV9jb3VudCA9IDBcblxuICB0cnlcbiAgICBib29rID1cbiAgICAgIHBhZ2Vfb3B0aW9uczoge31cblxuICAgIE1vZGUgPSAncGRmJ1xuICAgIEN1cnJlbnRCb29rID0gYm9va1xuXG4gICAgc2l6ZSA9IG9wdGlvbnMuc2l6ZVxuICAgIGlmIHNpemVcbiAgICAgIHt3aWR0aCwgaGVpZ2h0fSA9IGdldF9wYWdlX3NpemVfZGltZW5zaW9ucyBzaXplXG4gICAgICBfLmV4dGVuZCBib29rLnBhZ2Vfb3B0aW9ucywge3dpZHRoLCBoZWlnaHR9XG4gICAgICBjYW52YXMgPSBDb250ZXh0LmNhbnZhcyB8fD0gbmV3IENhbnZhcyB3aWR0aCwgaGVpZ2h0LCBNb2RlXG4gICAgICBjdHggPSBDb250ZXh0LmN0eCA9IGNhbnZhcy5nZXRDb250ZXh0ICcyZCdcbiAgICAgIGN0eC50ZXh0RHJhd2luZ01vZGUgPSAnZ2x5cGgnIGlmIE1vZGUgPT0gJ3BkZidcblxuICAgIGNiXG4gICAgICBwYWdlX2hlYWRlcjogKGhlYWRlcikgLT4gYm9vay5oZWFkZXIgPSBoZWFkZXJcbiAgICAgIHBhZ2VfZm9vdGVyOiAoZm9vdGVyKSAtPiBib29rLmZvb3RlciA9IGZvb3RlclxuICAgICAgd2l0aF9wYWdlOiAob3B0aW9ucywgZHJhd19wYWdlKSAtPlxuICAgICAgICBbb3B0aW9ucywgZHJhd19wYWdlXSA9IFt7fSwgb3B0aW9uc10gaWYgXy5pc0Z1bmN0aW9uKG9wdGlvbnMpXG4gICAgICAgIHJldHVybiBpZiBAZG9uZVxuICAgICAgICBvcHRpb25zID0gXy5leHRlbmQge30sIGJvb2sucGFnZV9vcHRpb25zLCBvcHRpb25zXG4gICAgICAgIHBhZ2VfY291bnQgKz0gMVxuICAgICAgICBpZiBDdXJyZW50UGFnZVxuICAgICAgICAgIGRyYXdfcGFnZSBDdXJyZW50UGFnZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgd2l0aF9wYWdlIG9wdGlvbnMsIGRyYXdfcGFnZVxuICAgICAgICBAZG9uZSA9IHRydWUgaWYgcGFnZV9saW1pdCBhbmQgcGFnZV9saW1pdCA8PSBwYWdlX2NvdW50XG5cbiAgICBpZiBjYW52YXNcbiAgICAgIHdyaXRlX3BkZiBjYW52YXMsIHBhdGguam9pbihCdWlsZERpcmVjdG9yeSwgXCIje2ZpbGVuYW1lfS5wZGZcIilcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLndhcm4gXCJObyBwYWdlc1wiXG4gIGZpbmFsbHlcbiAgICBDdXJyZW50Qm9vayA9IG51bGxcbiAgICBNb2RlID0gbnVsbFxuICAgIGNhbnZhcyA9IG51bGxcbiAgICBjdHggPSBudWxsXG5cbndyaXRlX3BkZiA9IChjYW52YXMsIHBhdGhuYW1lKSAtPlxuICBmcy53cml0ZUZpbGUgcGF0aG5hbWUsIGNhbnZhcy50b0J1ZmZlcigpLCAoZXJyKSAtPlxuICAgIGlmIGVyclxuICAgICAgY29uc29sZS5lcnJvciBcIkVycm9yICN7ZXJyLmNvZGV9IHdyaXRpbmcgdG8gI3tlcnIucGF0aH1cIlxuICAgIGVsc2VcbiAgICAgIGNvbnNvbGUuaW5mbyBcIlNhdmVkICN7cGF0aG5hbWV9XCJcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFBhcGVyU2l6ZXNcbiAgYWJvdmVcbiAgd2l0aF9ib29rXG4gIHdpdGhfZ3JpZFxuICB3aXRoX2dyaWRfYm94ZXNcbiAgd2l0aF9wYWdlXG4gIGRyYXdfdGV4dFxuICBib3hcbiAgaGJveFxuICBwYWRfYm94XG4gIHRleHRfYm94XG4gIGxhYmVsZWRcbiAgbWVhc3VyZV90ZXh0XG4gIGRpcmVjdG9yeVxuICBmaWxlbmFtZVxuICB3aXRoX2dyYXBoaWNzX2NvbnRleHRcbiAgd2l0aENhbnZhczogd2l0aF9jYW52YXNcbn1cbiIsIntQSSwgY29zLCBzaW4sIG1pbiwgbWF4fSA9IE1hdGhcbkNob3JkRGlhZ3JhbVN0eWxlID0gcmVxdWlyZSgnLi9jaG9yZF9kaWFncmFtJykuZGVmYXVsdFN0eWxlXG57YmxvY2ssIHdpdGhfZ3JhcGhpY3NfY29udGV4dH0gPSByZXF1aXJlICcuL2xheW91dCdcblxuZHJhd19waXRjaF9kaWFncmFtID0gKGN0eCwgcGl0Y2hfY2xhc3Nlcywgb3B0aW9ucz17ZHJhdzogdHJ1ZX0pIC0+XG4gIHtwaXRjaF9jb2xvcnMsIHBpdGNoX25hbWVzfSA9IG9wdGlvbnNcbiAgcGl0Y2hfY29sb3JzIHx8PSBDaG9yZERpYWdyYW1TdHlsZS5pbnRlcnZhbF9jbGFzc19jb2xvcnNcbiAgcGl0Y2hfbmFtZXMgfHw9ICdSIG0yIE0yIG0zIE0zIFA0IFRUIFA1IG02IE02IG03IE03Jy5zcGxpdCgvXFxzLylcbiAgIyBwaXRjaF9uYW1lcyA9ICcxIDJiIDIgM2IgMyA0IFQgNSA2YiA2IDdiIDcnLnNwbGl0KC9cXHMvKVxuICByID0gMTBcbiAgcl9sYWJlbCA9IHIgKyA3XG5cbiAgcGl0Y2hfY2xhc3NfYW5nbGUgPSAocGl0Y2hfY2xhc3MpIC0+XG4gICAgKHBpdGNoX2NsYXNzIC0gMykgKiAyICogUEkgLyAxMlxuXG4gIGJvdW5kcyA9IHtsZWZ0OiAwLCB0b3A6IDAsIHJpZ2h0OiAwLCBib3R0b206IDB9XG4gIGV4dGVuZF9ib3VuZHMgPSAobGVmdCwgdG9wLCBib3R0b20sIHJpZ2h0KSAtPlxuICAgICMgcmlnaHQgPz0gbGVmdFxuICAgICMgYm90dG9tID89IHRvcFxuICAgIGJvdW5kcy5sZWZ0ID0gbWluIGJvdW5kcy5sZWZ0LCBsZWZ0XG4gICAgYm91bmRzLnRvcCA9IG1pbiBib3VuZHMudG9wLCB0b3BcbiAgICBib3VuZHMucmlnaHQgPSBtYXggYm91bmRzLnJpZ2h0LCByaWdodCA/IGxlZnRcbiAgICBib3VuZHMuYm90dG9tID0gbWF4IGJvdW5kcy5ib3R0b20sIGJvdHRvbSA/IHRvcFxuXG4gIGZvciBwaXRjaF9jbGFzcyBpbiBwaXRjaF9jbGFzc2VzXG4gICAgYW5nbGUgPSBwaXRjaF9jbGFzc19hbmdsZSBwaXRjaF9jbGFzc1xuICAgIHggPSByICogY29zKGFuZ2xlKVxuICAgIHkgPSByICogc2luKGFuZ2xlKVxuXG4gICAgaWYgb3B0aW9ucy5kcmF3XG4gICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgIGN0eC5tb3ZlVG8gMCwgMFxuICAgICAgY3R4LmxpbmVUbyB4LCB5XG4gICAgICBjdHguc3Ryb2tlKClcbiAgICBleHRlbmRfYm91bmRzIHgsIHlcblxuICAgIGlmIG9wdGlvbnMuZHJhd1xuICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICBjdHguYXJjIHgsIHksIDIsIDAsIDIgKiBQSSwgZmFsc2VcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBwaXRjaF9jb2xvcnNbcGl0Y2hfY2xhc3NdIG9yICdibGFjaydcbiAgICAgIGN0eC5maWxsKClcblxuICBjdHguZm9udCA9ICc0cHQgVGltZXMnXG4gIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snXG4gIGZvciBjbGFzc19uYW1lLCBwaXRjaF9jbGFzcyBpbiBwaXRjaF9uYW1lc1xuICAgIGFuZ2xlID0gcGl0Y2hfY2xhc3NfYW5nbGUgcGl0Y2hfY2xhc3NcbiAgICBtID0gY3R4Lm1lYXN1cmVUZXh0IGNsYXNzX25hbWVcbiAgICB4ID0gcl9sYWJlbCAqIGNvcyhhbmdsZSkgLSBtLndpZHRoIC8gMlxuICAgIHkgPSByX2xhYmVsICogc2luKGFuZ2xlKSArIG0uZW1IZWlnaHREZXNjZW50XG4gICAgY3R4LmZpbGxUZXh0IGNsYXNzX25hbWUsIHgsIHkgaWYgb3B0aW9ucy5kcmF3XG4gICAgYm91bmRzLmxlZnQgPSBtaW4gYm91bmRzLmxlZnQsIHhcbiAgICBib3VuZHMucmlnaHQgPSBtYXggYm91bmRzLnJpZ2h0LCB4ICsgbS53aWR0aFxuICAgIGJvdW5kcy50b3AgPSBtaW4gYm91bmRzLnRvcCwgeSAtIG0uZW1IZWlnaHRBc2NlbnRcbiAgICBib3VuZHMuYm90dG9tID0gbWF4IGJvdW5kcy5ib3R0b20sIHkgKyBtLmVtSGVpZ2h0QXNjZW50XG5cbiAgcmV0dXJuIGJvdW5kc1xuXG5waXRjaF9kaWFncmFtX2Jsb2NrID0gKHBpdGNoX2NsYXNzZXMsIHNjYWxlPTEpIC0+XG4gIGJvdW5kcyA9IHdpdGhfZ3JhcGhpY3NfY29udGV4dCAoY3R4KSAtPiBkcmF3X3BpdGNoX2RpYWdyYW0gY3R4LCBwaXRjaF9jbGFzc2VzLCBkcmF3OiBmYWxzZSwgbWVhc3VyZTogdHJ1ZVxuICBibG9ja1xuICAgIHdpZHRoOiAoYm91bmRzLnJpZ2h0IC0gYm91bmRzLmxlZnQpICogc2NhbGVcbiAgICBoZWlnaHQ6IChib3VuZHMuYm90dG9tIC0gYm91bmRzLnRvcCkgKiBzY2FsZVxuICAgIGRyYXc6IC0+XG4gICAgICB3aXRoX2dyYXBoaWNzX2NvbnRleHQgKGN0eCkgLT5cbiAgICAgICAgY3R4LnNjYWxlIHNjYWxlLCBzY2FsZVxuICAgICAgICBjdHgudHJhbnNsYXRlIC1ib3VuZHMubGVmdCwgLWJvdW5kcy5ib3R0b21cbiAgICAgICAgZHJhd19waXRjaF9kaWFncmFtIGN0eCwgcGl0Y2hfY2xhc3Nlc1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGRyYXc6IGRyYXdfcGl0Y2hfZGlhZ3JhbVxuICBibG9jazogcGl0Y2hfZGlhZ3JhbV9ibG9ja1xuIiwiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG5cbk5vdGVOYW1lcyA9IFwiRyMgQSBBIyBCIEMgQyMgRCBEIyBFIEYgRiMgR1wiLnNwbGl0KC9cXHMvKVxuXG5JbnRlcnZhbE5hbWVzID0gWydQMScsICdtMicsICdNMicsICdtMycsICdNMycsICdQNCcsICdUVCcsICdQNScsICdtNicsICdNNicsICdtNycsICdNNycsICdQOCddXG5cbkxvbmdJbnRlcnZhbE5hbWVzID0gW1xuICAnVW5pc29uJywgJ01pbm9yIDJuZCcsICdNYWpvciAybmQnLCAnTWlub3IgM3JkJywgJ01ham9yIDNyZCcsICdQZXJmZWN0IDR0aCcsXG4gICdUcml0b25lJywgJ1BlcmZlY3QgNXRoJywgJ01pbm9yIDZ0aCcsICdNYWpvciA2dGgnLCAnTWlub3IgN3RoJywgJ01ham9yIDd0aCcsICdPY3RhdmUnXVxuXG5TY2FsZXMgPSBkbyAtPlxuICBzY2FsZV9zcGVjcyA9IFtcbiAgICAnRGlhdG9uaWMgTWFqb3I6IDAyNDU3OWUnXG4gICAgJ05hdHVyYWwgTWlub3I6IDAyMzU3OHQnXG4gICAgJ01lbG9kaWMgTWlub3I6IDAyMzU3OWUnXG4gICAgJ0hhcm1vbmljIE1pbm9yOiAwMjM1NzhlJ1xuICAgICdQZW50YXRvbmljIE1ham9yOiAwMjQ3OSdcbiAgICAnUGVudGF0b25pYyBNaW5vcjogMDM1N3QnXG4gICAgJ0JsdWVzOiAwMzU2N3QnXG4gICAgJ0ZyZXlnaXNoOiAwMTQ1Nzh0J1xuICAgICdXaG9sZSBUb25lOiAwMjQ2OHQnXG4gICAgIyAnT2N0YXRvbmljJyBpcyB0aGUgY2xhc3NpY2FsIG5hbWUuIEl0J3MgdGhlIGphenogJ0RpbWluaXNoZWQnIHNjYWxlLlxuICAgICdPY3RhdG9uaWM6IDAyMzU2ODllJ1xuICBdXG4gIHNjYWxlcyA9IFtdXG4gIGZvciBzcGVjLCBpIGluIHNjYWxlX3NwZWNzXG4gICAgW25hbWUsIHRvbmVzXSA9IHNwZWMuc3BsaXQoLzpcXHMqLywgMilcbiAgICB0b25lcyA9IF8ubWFwIHRvbmVzLCAoYykgLT4geyd0JzoxMCwgJ2UnOjExfVtjXSBvciBOdW1iZXIoYylcbiAgICAjIGNvbnNvbGUuaW5mbyAnc2V0JywgbmFtZSwgaVxuICAgIHNjYWxlc1tuYW1lXSA9IHNjYWxlc1tpXSA9IHtuYW1lLCB0b25lc31cbiAgc2NhbGVzXG5cbk1vZGVzID0gZG8gKHJvb3RfdG9uZXM9U2NhbGVzWydEaWF0b25pYyBNYWpvciddLnRvbmVzKSAtPlxuICBtb2RlX25hbWVzID0gJ0lvbmlhbiBEb3JpYW4gUGhyeWdpYW4gTHlkaWFuIE1peG9seWRpYW4gQWVvbGlhbiBMb2NyaWFuJy5zcGxpdCgvXFxzLylcbiAgbW9kZXMgPSBbXVxuICBmb3IgZGlzcGxhY2VtZW50LCBpIGluIHJvb3RfdG9uZXNcbiAgICBuYW1lID0gbW9kZV9uYW1lc1tpXVxuICAgIHRvbmVzID0gKChkIC0gZGlzcGxhY2VtZW50ICsgMTIpICUgMTIgZm9yIGQgaW4gcm9vdF90b25lc1tpLi4uXS5jb25jYXQgcm9vdF90b25lc1suLi5pXSlcbiAgICBtb2Rlc1tuYW1lXSA9IG1vZGVzW2ldID0ge25hbWUsIGRlZ3JlZTogaSwgdG9uZXN9XG4gIG1vZGVzXG5cbiMgSW5kZXhlZCBieSBzY2FsZSBkZWdyZWVcbkZ1bmN0aW9ucyA9ICdUb25pYyBTdXBlcnRvbmljIE1lZGlhbnQgU3ViZG9taW5hbnQgRG9taW5hbnQgU3VibWVkaWFudCBTdWJ0b25pYyBMZWFkaW5nJy5zcGxpdCgvXFxzLylcblxuY2xhc3MgQ2hvcmRcbiAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgIEBuYW1lID0gb3B0aW9ucy5uYW1lXG4gICAgQGZ1bGxfbmFtZSA9IG9wdGlvbnMuZnVsbF9uYW1lXG4gICAgQGFiYnJzID0gb3B0aW9ucy5hYmJycyBvciBbb3B0aW9ucy5hYmJyXVxuICAgIEBhYmJycyA9IEBhYmJycy5zcGxpdCgvcy8pIGlmIHR5cGVvZiBAYWJicnMgPT0gJ3N0cmluZydcbiAgICBAYWJiciA9IG9wdGlvbnMuYWJiciBvciBAYWJicnNbMF1cbiAgICBAcGl0Y2hfY2xhc3NlcyA9IG9wdGlvbnMucGl0Y2hfY2xhc3Nlc1xuICAgIEByb290ID0gb3B0aW9ucy5yb290XG4gICAgQHJvb3QgPSBOb3RlTmFtZXMuaW5kZXhPZiBAcm9vdCBpZiB0eXBlb2YgQHJvb3QgPT0gJ3N0cmluZydcbiAgICBkZWdyZWVzID0gKDEgKyAyICogaSBmb3IgaSBpbiBbMC4uQHBpdGNoX2NsYXNzZXMubGVuZ3RoXSlcbiAgICBkZWdyZWVzWzFdID0geydTdXMyJzoyLCAnU3VzNCc6NH1bQG5hbWVdIHx8IGRlZ3JlZXNbMV1cbiAgICBkZWdyZWVzWzNdID0gNiBpZiBAbmFtZS5tYXRjaCAvNi9cbiAgICBAY29tcG9uZW50cyA9IGZvciBwYywgcGNpIGluIEBwaXRjaF9jbGFzc2VzXG4gICAgICBuYW1lID0gSW50ZXJ2YWxOYW1lc1twY11cbiAgICAgIGRlZ3JlZSA9IGRlZ3JlZXNbcGNpXVxuICAgICAgaWYgcGMgPT0gMFxuICAgICAgICBuYW1lID0gJ1InXG4gICAgICBlbHNlIHVubGVzcyBOdW1iZXIobmFtZS5tYXRjaCgvXFxkKy8pP1swXSkgPT0gZGVncmVlXG4gICAgICAgIG5hbWUgPSBcIkEje2RlZ3JlZX1cIiBpZiBOdW1iZXIoSW50ZXJ2YWxOYW1lc1twYyAtIDFdLm1hdGNoKC9cXGQrLyk/WzBdKSA9PSBkZWdyZWVcbiAgICAgICAgbmFtZSA9IFwiZCN7ZGVncmVlfVwiIGlmIE51bWJlcihJbnRlcnZhbE5hbWVzW3BjICsgMV0ubWF0Y2goL1xcZCsvKT9bMF0pID09IGRlZ3JlZVxuICAgICAgbmFtZVxuICAgIGlmIHR5cGVvZiBAcm9vdCA9PSAnbnVtYmVyJ1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IHRoaXMsICduYW1lJywgZ2V0OiAtPlxuICAgICAgICBcIiN7Tm90ZU5hbWVzW0Byb290XX0je0BhYmJyfVwiXG5cbiAgYXQ6IChyb290KSAtPlxuICAgIG5ldyBDaG9yZFxuICAgICAgbmFtZTogQG5hbWVcbiAgICAgIGZ1bGxfbmFtZTogQGZ1bGxfbmFtZVxuICAgICAgYWJicnM6IEBhYmJyc1xuICAgICAgcGl0Y2hfY2xhc3NlczogQHBpdGNoX2NsYXNzZXNcbiAgICAgIHJvb3Q6IHJvb3RcblxuICBkZWdyZWVfbmFtZTogKGRlZ3JlZV9pbmRleCkgLT5cbiAgICBAY29tcG9uZW50c1tkZWdyZWVfaW5kZXhdXG5cbkNob3JkRGVmaW5pdGlvbnMgPSBbXG4gIHtuYW1lOiAnTWFqb3InLCBhYmJyczogWycnLCAnTSddLCBwaXRjaF9jbGFzc2VzOiAnMDQ3J30sXG4gIHtuYW1lOiAnTWlub3InLCBhYmJyOiAnbScsIHBpdGNoX2NsYXNzZXM6ICcwMzcnfSxcbiAge25hbWU6ICdBdWdtZW50ZWQnLCBhYmJyczogWycrJywgJ2F1ZyddLCBwaXRjaF9jbGFzc2VzOiAnMDQ4J30sXG4gIHtuYW1lOiAnRGltaW5pc2hlZCcsIGFiYnJzOiBbJ8KwJywgJ2RpbSddLCBwaXRjaF9jbGFzc2VzOiAnMDM2J30sXG4gIHtuYW1lOiAnU3VzMicsIGFiYnI6ICdzdXMyJywgcGl0Y2hfY2xhc3NlczogJzAyNyd9LFxuICB7bmFtZTogJ1N1czQnLCBhYmJyOiAnc3VzNCcsIHBpdGNoX2NsYXNzZXM6ICcwNTcnfSxcbiAge25hbWU6ICdEb21pbmFudCA3dGgnLCBhYmJyczogWyc3JywgJ2RvbTcnXSwgcGl0Y2hfY2xhc3NlczogJzA0N3QnfSxcbiAge25hbWU6ICdBdWdtZW50ZWQgN3RoJywgYWJicnM6IFsnKzcnLCAnN2F1ZyddLCBwaXRjaF9jbGFzc2VzOiAnMDQ4dCd9LFxuICB7bmFtZTogJ0RpbWluaXNoZWQgN3RoJywgYWJicnM6IFsnwrA3JywgJ2RpbTcnXSwgcGl0Y2hfY2xhc3NlczogJzAzNjknfSxcbiAge25hbWU6ICdNYWpvciA3dGgnLCBhYmJyOiAnbWFqNycsIHBpdGNoX2NsYXNzZXM6ICcwNDdlJ30sXG4gIHtuYW1lOiAnTWlub3IgN3RoJywgYWJicjogJ21pbjcnLCBwaXRjaF9jbGFzc2VzOiAnMDM3dCd9LFxuICB7bmFtZTogJ0RvbWluYW50IDdiNScsIGFiYnI6ICc3YjUnLCBwaXRjaF9jbGFzc2VzOiAnMDQ2dCd9LFxuICAjIGZvbGxvd2luZyBpcyBhbHNvIGhhbGYtZGltaW5pc2hlZCA3dGhcbiAge25hbWU6ICdNaW5vciA3dGggYjUnLCBhYmJyczogWyfDuCcsICfDmCcsICdtN2I1J10sIHBpdGNoX2NsYXNzZXM6ICcwMzZ0J30sXG4gIHtuYW1lOiAnRGltaW5pc2hlZCBNYWogN3RoJywgYWJicjogJ8KwTWFqNycsIHBpdGNoX2NsYXNzZXM6ICcwMzZlJ30sXG4gIHtuYW1lOiAnTWlub3ItTWFqb3IgN3RoJywgYWJicnM6IFsnbWluL21hajcnLCAnbWluKG1hajcpJ10sIHBpdGNoX2NsYXNzZXM6ICcwMzdlJ30sXG4gIHtuYW1lOiAnNnRoJywgYWJicnM6IFsnNicsICdNNicsICdNNicsICdtYWo2J10sIHBpdGNoX2NsYXNzZXM6ICcwNDc5J30sXG4gIHtuYW1lOiAnTWlub3IgNnRoJywgYWJicnM6IFsnbTYnLCAnbWluNiddLCBwaXRjaF9jbGFzc2VzOiAnMDM3OSd9LFxuXVxuXG4jIENob3JkcyBpcyBhbiBhcnJheSBvZiBjaG9yZCBjbGFzc2VzXG5DaG9yZHMgPSBDaG9yZERlZmluaXRpb25zLm1hcCAoc3BlYykgLT5cbiAgc3BlYy5mdWxsX25hbWUgPSBzcGVjLm5hbWVcbiAgc3BlYy5uYW1lID0gc3BlYy5uYW1lXG4gICAgLnJlcGxhY2UoL01ham9yKD8hJCkvLCAnTWFqJylcbiAgICAucmVwbGFjZSgvTWlub3IoPyEkKS8sICdNaW4nKVxuICAgIC5yZXBsYWNlKCdEb21pbmFudCcsICdEb20nKVxuICAgIC5yZXBsYWNlKCdEaW1pbmlzaGVkJywgJ0RpbScpXG4gIHNwZWMuYWJicnMgb3I9IFtzcGVjLmFiYnJdXG4gIHNwZWMuYWJicnMgPSBzcGVjLmFiYnJzLnNwbGl0KC9zLykgaWYgdHlwZW9mIHNwZWMuYWJicnMgPT0gJ3N0cmluZydcbiAgc3BlYy5hYmJyIG9yPSBzcGVjLmFiYnJzWzBdXG4gIHNwZWMucGl0Y2hfY2xhc3NlcyA9IF8ubWFwIHNwZWMucGl0Y2hfY2xhc3NlcywgKGMpIC0+IHsndCc6MTAsICdlJzoxMX1bY10gb3IgTnVtYmVyKGMpXG4gIG5ldyBDaG9yZCBzcGVjXG5cbiMgQ2hvcmRzIGlzIGFsc28gaW5kZXhlZCBieSBjaG9yZCBuYWVzIGFuZCBhYmJyZXZpYXRpb25zXG5mb3IgY2hvcmQgaW4gQ2hvcmRzXG4gIHtuYW1lLCBmdWxsX25hbWUsIGFiYnJzfSA9IGNob3JkXG4gIENob3Jkc1trZXldID0gY2hvcmQgZm9yIGtleSBpbiBbbmFtZSwgZnVsbF9uYW1lXS5jb25jYXQoYWJicnMpXG5cbiMgVGhlIGludGVydmFsIGNsYXNzIChpbnRlZ2VyIGluIFswLi4uMTJdKSBiZXR3ZWVuIHR3byBwaXRjaCBjbGFzcyBudW1iZXJzXG5pbnRlcnZhbF9jbGFzc19iZXR3ZWVuID0gKHBjYSwgcGNiKSAtPlxuICBuID0gKHBjYiAtIHBjYSkgJSAxMlxuICBuICs9IDEyIHdoaWxlIG4gPCAwXG4gIHJldHVybiBuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBDaG9yZHNcbiAgSW50ZXJ2YWxOYW1lc1xuICBMb25nSW50ZXJ2YWxOYW1lc1xuICBNb2Rlc1xuICBOb3RlTmFtZXNcbiAgU2NhbGVzXG4gIGludGVydmFsX2NsYXNzX2JldHdlZW5cbn1cbiIsIkZ1bmN0aW9uOjpkZWZpbmUgfHw9IChuYW1lLCBkZXNjKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgbmFtZSwgZGVzY1xuXG5GdW5jdGlvbjo6Y2FjaGVkX2dldHRlciB8fD0gKG5hbWUsIGZuKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgbmFtZSwgZ2V0OiAtPlxuICAgIGNhY2hlID0gQF9nZXR0ZXJfY2FjaGUgfHw9IHt9XG4gICAgcmV0dXJuIGNhY2hlW25hbWVdIGlmIG5hbWUgb2YgY2FjaGVcbiAgICBjYWNoZVtuYW1lXSA9IGZuLmNhbGwodGhpcylcblxuaHN2MnJnYiA9ICh7aCwgcywgdn0pIC0+XG4gIGggLz0gMzYwXG4gIGMgPSB2ICogc1xuICB4ID0gYyAqICgxIC0gTWF0aC5hYnMoKGggKiA2KSAlIDIgLSAxKSlcbiAgY29tcG9uZW50cyA9IHN3aXRjaCBNYXRoLmZsb29yKGggKiA2KSAlIDZcbiAgICB3aGVuIDAgdGhlbiBbYywgeCwgMF1cbiAgICB3aGVuIDEgdGhlbiBbeCwgYywgMF1cbiAgICB3aGVuIDIgdGhlbiBbMCwgYywgeF1cbiAgICB3aGVuIDMgdGhlbiBbMCwgeCwgY11cbiAgICB3aGVuIDQgdGhlbiBbeCwgMCwgY11cbiAgICB3aGVuIDUgdGhlbiBbYywgMCwgeF1cbiAgW3IsIGcsIGJdID0gKGNvbXBvbmVudCArIHYgLSBjIGZvciBjb21wb25lbnQgaW4gY29tcG9uZW50cylcbiAge3IsIGcsIGJ9XG5cbnJnYjJjc3MgPSAoe3IsIGcsIGJ9KSAtPlxuICBbciwgZywgYl0gPSAoTWF0aC5mbG9vcigyNTUgKiBjKSBmb3IgYyBpbiBbciwgZywgYl0pXG4gIFwicmdiKCN7cn0sICN7Z30sICN7Yn0pXCJcblxuaHN2MmNzcyA9IChoc3YpIC0+IHJnYjJjc3MgaHN2MnJnYihoc3YpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBoc3YyY3NzXG4gIGhzdjJyZ2JcbiAgcmdiMmNzc1xufVxuIiwidmFyIHByb2Nlc3M9cmVxdWlyZShcIl9fYnJvd3NlcmlmeV9wcm9jZXNzXCIpO2lmICghcHJvY2Vzcy5FdmVudEVtaXR0ZXIpIHByb2Nlc3MuRXZlbnRFbWl0dGVyID0gZnVuY3Rpb24gKCkge307XG5cbnZhciBFdmVudEVtaXR0ZXIgPSBleHBvcnRzLkV2ZW50RW1pdHRlciA9IHByb2Nlc3MuRXZlbnRFbWl0dGVyO1xudmFyIGlzQXJyYXkgPSB0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJ1xuICAgID8gQXJyYXkuaXNBcnJheVxuICAgIDogZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgfVxuO1xuZnVuY3Rpb24gaW5kZXhPZiAoeHMsIHgpIHtcbiAgICBpZiAoeHMuaW5kZXhPZikgcmV0dXJuIHhzLmluZGV4T2YoeCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoeCA9PT0geHNbaV0pIHJldHVybiBpO1xuICAgIH1cbiAgICByZXR1cm4gLTE7XG59XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW5cbi8vIDEwIGxpc3RlbmVycyBhcmUgYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaFxuLy8gaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG4vL1xuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHt9O1xuICB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzID0gbjtcbn07XG5cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNBcnJheSh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSlcbiAgICB7XG4gICAgICBpZiAoYXJndW1lbnRzWzFdIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgYXJndW1lbnRzWzFdOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5jYXVnaHQsIHVuc3BlY2lmaWVkICdlcnJvcicgZXZlbnQuXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gZmFsc2U7XG4gIHZhciBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBpZiAoIWhhbmRsZXIpIHJldHVybiBmYWxzZTtcblxuICBpZiAodHlwZW9mIGhhbmRsZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAoaXNBcnJheShoYW5kbGVyKSkge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIHZhciBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG4vLyBFdmVudEVtaXR0ZXIgaXMgZGVmaW5lZCBpbiBzcmMvbm9kZV9ldmVudHMuY2Ncbi8vIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCgpIGlzIGFsc28gZGVmaW5lZCB0aGVyZS5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIGxpc3RlbmVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhZGRMaXN0ZW5lciBvbmx5IHRha2VzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xuICB9XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT0gXCJuZXdMaXN0ZW5lcnNcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJzXCIuXG4gIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHtcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgfSBlbHNlIGlmIChpc0FycmF5KHRoaXMuX2V2ZW50c1t0eXBlXSkpIHtcblxuICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgICB2YXIgbTtcbiAgICAgIGlmICh0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbSA9IHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtID0gZGVmYXVsdE1heExpc3RlbmVycztcbiAgICAgIH1cblxuICAgICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYub24odHlwZSwgZnVuY3Rpb24gZygpIHtcbiAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICgnZnVuY3Rpb24nICE9PSB0eXBlb2YgbGlzdGVuZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlbW92ZUxpc3RlbmVyIG9ubHkgdGFrZXMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XG4gIH1cblxuICAvLyBkb2VzIG5vdCB1c2UgbGlzdGVuZXJzKCksIHNvIG5vIHNpZGUgZWZmZWN0IG9mIGNyZWF0aW5nIF9ldmVudHNbdHlwZV1cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSkgcmV0dXJuIHRoaXM7XG5cbiAgdmFyIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzQXJyYXkobGlzdCkpIHtcbiAgICB2YXIgaSA9IGluZGV4T2YobGlzdCwgbGlzdGVuZXIpO1xuICAgIGlmIChpIDwgMCkgcmV0dXJuIHRoaXM7XG4gICAgbGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgaWYgKGxpc3QubGVuZ3RoID09IDApXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICB9IGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSA9PT0gbGlzdGVuZXIpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGRvZXMgbm90IHVzZSBsaXN0ZW5lcnMoKSwgc28gbm8gc2lkZSBlZmZlY3Qgb2YgY3JlYXRpbmcgX2V2ZW50c1t0eXBlXVxuICBpZiAodHlwZSAmJiB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW3R5cGVdKSB0aGlzLl9ldmVudHNbdHlwZV0gPSBudWxsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKSB0aGlzLl9ldmVudHNbdHlwZV0gPSBbXTtcbiAgaWYgKCFpc0FycmF5KHRoaXMuX2V2ZW50c1t0eXBlXSkpIHtcbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgfVxuICByZXR1cm4gdGhpcy5fZXZlbnRzW3R5cGVdO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAodHlwZW9mIGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSA9PT0gJ2Z1bmN0aW9uJylcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG4iLCIvLyBub3RoaW5nIHRvIHNlZSBoZXJlLi4uIG5vIGZpbGUgbWV0aG9kcyBmb3IgdGhlIGJyb3dzZXJcbiIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKTtmdW5jdGlvbiBmaWx0ZXIgKHhzLCBmbikge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChmbih4c1tpXSwgaSwgeHMpKSByZXMucHVzaCh4c1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG5cbi8vIHJlc29sdmVzIC4gYW5kIC4uIGVsZW1lbnRzIGluIGEgcGF0aCBhcnJheSB3aXRoIGRpcmVjdG9yeSBuYW1lcyB0aGVyZVxuLy8gbXVzdCBiZSBubyBzbGFzaGVzLCBlbXB0eSBlbGVtZW50cywgb3IgZGV2aWNlIG5hbWVzIChjOlxcKSBpbiB0aGUgYXJyYXlcbi8vIChzbyBhbHNvIG5vIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHNsYXNoZXMgLSBpdCBkb2VzIG5vdCBkaXN0aW5ndWlzaFxuLy8gcmVsYXRpdmUgYW5kIGFic29sdXRlIHBhdGhzKVxuZnVuY3Rpb24gbm9ybWFsaXplQXJyYXkocGFydHMsIGFsbG93QWJvdmVSb290KSB7XG4gIC8vIGlmIHRoZSBwYXRoIHRyaWVzIHRvIGdvIGFib3ZlIHRoZSByb290LCBgdXBgIGVuZHMgdXAgPiAwXG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIGkgPSBwYXJ0cy5sZW5ndGg7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGxhc3QgPSBwYXJ0c1tpXTtcbiAgICBpZiAobGFzdCA9PSAnLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgcGFydHMudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGFydHM7XG59XG5cbi8vIFJlZ2V4IHRvIHNwbGl0IGEgZmlsZW5hbWUgaW50byBbKiwgZGlyLCBiYXNlbmFtZSwgZXh0XVxuLy8gcG9zaXggdmVyc2lvblxudmFyIHNwbGl0UGF0aFJlID0gL14oLitcXC8oPyEkKXxcXC8pPygoPzouKz8pPyhcXC5bXi5dKik/KSQvO1xuXG4vLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlc29sdmUgPSBmdW5jdGlvbigpIHtcbnZhciByZXNvbHZlZFBhdGggPSAnJyxcbiAgICByZXNvbHZlZEFic29sdXRlID0gZmFsc2U7XG5cbmZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoOyBpID49IC0xICYmICFyZXNvbHZlZEFic29sdXRlOyBpLS0pIHtcbiAgdmFyIHBhdGggPSAoaSA+PSAwKVxuICAgICAgPyBhcmd1bWVudHNbaV1cbiAgICAgIDogcHJvY2Vzcy5jd2QoKTtcblxuICAvLyBTa2lwIGVtcHR5IGFuZCBpbnZhbGlkIGVudHJpZXNcbiAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJyB8fCAhcGF0aCkge1xuICAgIGNvbnRpbnVlO1xuICB9XG5cbiAgcmVzb2x2ZWRQYXRoID0gcGF0aCArICcvJyArIHJlc29sdmVkUGF0aDtcbiAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckF0KDApID09PSAnLyc7XG59XG5cbi8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcbi8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxuXG4vLyBOb3JtYWxpemUgdGhlIHBhdGhcbnJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihyZXNvbHZlZFBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhcmVzb2x2ZWRBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIHJldHVybiAoKHJlc29sdmVkQWJzb2x1dGUgPyAnLycgOiAnJykgKyByZXNvbHZlZFBhdGgpIHx8ICcuJztcbn07XG5cbi8vIHBhdGgubm9ybWFsaXplKHBhdGgpXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbnZhciBpc0Fic29sdXRlID0gcGF0aC5jaGFyQXQoMCkgPT09ICcvJyxcbiAgICB0cmFpbGluZ1NsYXNoID0gcGF0aC5zbGljZSgtMSkgPT09ICcvJztcblxuLy8gTm9ybWFsaXplIHRoZSBwYXRoXG5wYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhaXNBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIGlmICghcGF0aCAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHBhdGggPSAnLic7XG4gIH1cbiAgaWYgKHBhdGggJiYgdHJhaWxpbmdTbGFzaCkge1xuICAgIHBhdGggKz0gJy8nO1xuICB9XG4gIFxuICByZXR1cm4gKGlzQWJzb2x1dGUgPyAnLycgOiAnJykgKyBwYXRoO1xufTtcblxuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmpvaW4gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHBhdGhzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgcmV0dXJuIGV4cG9ydHMubm9ybWFsaXplKGZpbHRlcihwYXRocywgZnVuY3Rpb24ocCwgaW5kZXgpIHtcbiAgICByZXR1cm4gcCAmJiB0eXBlb2YgcCA9PT0gJ3N0cmluZyc7XG4gIH0pLmpvaW4oJy8nKSk7XG59O1xuXG5cbmV4cG9ydHMuZGlybmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIGRpciA9IHNwbGl0UGF0aFJlLmV4ZWMocGF0aClbMV0gfHwgJyc7XG4gIHZhciBpc1dpbmRvd3MgPSBmYWxzZTtcbiAgaWYgKCFkaXIpIHtcbiAgICAvLyBObyBkaXJuYW1lXG4gICAgcmV0dXJuICcuJztcbiAgfSBlbHNlIGlmIChkaXIubGVuZ3RoID09PSAxIHx8XG4gICAgICAoaXNXaW5kb3dzICYmIGRpci5sZW5ndGggPD0gMyAmJiBkaXIuY2hhckF0KDEpID09PSAnOicpKSB7XG4gICAgLy8gSXQgaXMganVzdCBhIHNsYXNoIG9yIGEgZHJpdmUgbGV0dGVyIHdpdGggYSBzbGFzaFxuICAgIHJldHVybiBkaXI7XG4gIH0gZWxzZSB7XG4gICAgLy8gSXQgaXMgYSBmdWxsIGRpcm5hbWUsIHN0cmlwIHRyYWlsaW5nIHNsYXNoXG4gICAgcmV0dXJuIGRpci5zdWJzdHJpbmcoMCwgZGlyLmxlbmd0aCAtIDEpO1xuICB9XG59O1xuXG5cbmV4cG9ydHMuYmFzZW5hbWUgPSBmdW5jdGlvbihwYXRoLCBleHQpIHtcbiAgdmFyIGYgPSBzcGxpdFBhdGhSZS5leGVjKHBhdGgpWzJdIHx8ICcnO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgY29tcGFyaXNvbiBjYXNlLWluc2Vuc2l0aXZlIG9uIHdpbmRvd3M/XG4gIGlmIChleHQgJiYgZi5zdWJzdHIoLTEgKiBleHQubGVuZ3RoKSA9PT0gZXh0KSB7XG4gICAgZiA9IGYuc3Vic3RyKDAsIGYubGVuZ3RoIC0gZXh0Lmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGY7XG59O1xuXG5cbmV4cG9ydHMuZXh0bmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aFJlLmV4ZWMocGF0aClbM10gfHwgJyc7XG59O1xuXG5leHBvcnRzLnJlbGF0aXZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgZnJvbSA9IGV4cG9ydHMucmVzb2x2ZShmcm9tKS5zdWJzdHIoMSk7XG4gIHRvID0gZXhwb3J0cy5yZXNvbHZlKHRvKS5zdWJzdHIoMSk7XG5cbiAgZnVuY3Rpb24gdHJpbShhcnIpIHtcbiAgICB2YXIgc3RhcnQgPSAwO1xuICAgIGZvciAoOyBzdGFydCA8IGFyci5sZW5ndGg7IHN0YXJ0KyspIHtcbiAgICAgIGlmIChhcnJbc3RhcnRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgdmFyIGVuZCA9IGFyci5sZW5ndGggLSAxO1xuICAgIGZvciAoOyBlbmQgPj0gMDsgZW5kLS0pIHtcbiAgICAgIGlmIChhcnJbZW5kXSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzdGFydCA+IGVuZCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBhcnIuc2xpY2Uoc3RhcnQsIGVuZCAtIHN0YXJ0ICsgMSk7XG4gIH1cblxuICB2YXIgZnJvbVBhcnRzID0gdHJpbShmcm9tLnNwbGl0KCcvJykpO1xuICB2YXIgdG9QYXJ0cyA9IHRyaW0odG8uc3BsaXQoJy8nKSk7XG5cbiAgdmFyIGxlbmd0aCA9IE1hdGgubWluKGZyb21QYXJ0cy5sZW5ndGgsIHRvUGFydHMubGVuZ3RoKTtcbiAgdmFyIHNhbWVQYXJ0c0xlbmd0aCA9IGxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChmcm9tUGFydHNbaV0gIT09IHRvUGFydHNbaV0pIHtcbiAgICAgIHNhbWVQYXJ0c0xlbmd0aCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB2YXIgb3V0cHV0UGFydHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHNhbWVQYXJ0c0xlbmd0aDsgaSA8IGZyb21QYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFBhcnRzLnB1c2goJy4uJyk7XG4gIH1cblxuICBvdXRwdXRQYXJ0cyA9IG91dHB1dFBhcnRzLmNvbmNhdCh0b1BhcnRzLnNsaWNlKHNhbWVQYXJ0c0xlbmd0aCkpO1xuXG4gIHJldHVybiBvdXRwdXRQYXJ0cy5qb2luKCcvJyk7XG59O1xuXG5leHBvcnRzLnNlcCA9ICcvJztcbiIsInZhciBldmVudHMgPSByZXF1aXJlKCdldmVudHMnKTtcblxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcbmV4cG9ydHMuaXNEYXRlID0gZnVuY3Rpb24ob2JqKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IERhdGVdJ307XG5leHBvcnRzLmlzUmVnRXhwID0gZnVuY3Rpb24ob2JqKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IFJlZ0V4cF0nfTtcblxuXG5leHBvcnRzLnByaW50ID0gZnVuY3Rpb24gKCkge307XG5leHBvcnRzLnB1dHMgPSBmdW5jdGlvbiAoKSB7fTtcbmV4cG9ydHMuZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuXG5leHBvcnRzLmluc3BlY3QgPSBmdW5jdGlvbihvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMpIHtcbiAgdmFyIHNlZW4gPSBbXTtcblxuICB2YXIgc3R5bGl6ZSA9IGZ1bmN0aW9uKHN0ciwgc3R5bGVUeXBlKSB7XG4gICAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG4gICAgdmFyIHN0eWxlcyA9XG4gICAgICAgIHsgJ2JvbGQnIDogWzEsIDIyXSxcbiAgICAgICAgICAnaXRhbGljJyA6IFszLCAyM10sXG4gICAgICAgICAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAgICAgICAgICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICAgICAgICAgJ3doaXRlJyA6IFszNywgMzldLFxuICAgICAgICAgICdncmV5JyA6IFs5MCwgMzldLFxuICAgICAgICAgICdibGFjaycgOiBbMzAsIDM5XSxcbiAgICAgICAgICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgICAgICAgICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgICAgICAgICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICAgICAgICAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICAgICAgICAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgICAgICAgICAneWVsbG93JyA6IFszMywgMzldIH07XG5cbiAgICB2YXIgc3R5bGUgPVxuICAgICAgICB7ICdzcGVjaWFsJzogJ2N5YW4nLFxuICAgICAgICAgICdudW1iZXInOiAnYmx1ZScsXG4gICAgICAgICAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgICAgICAgICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAgICAgICAgICdudWxsJzogJ2JvbGQnLFxuICAgICAgICAgICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAgICAgICAgICdkYXRlJzogJ21hZ2VudGEnLFxuICAgICAgICAgIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICAgICAgICAgJ3JlZ2V4cCc6ICdyZWQnIH1bc3R5bGVUeXBlXTtcblxuICAgIGlmIChzdHlsZSkge1xuICAgICAgcmV0dXJuICdcXHUwMDFiWycgKyBzdHlsZXNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgICAnXFx1MDAxYlsnICsgc3R5bGVzW3N0eWxlXVsxXSArICdtJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gIH07XG4gIGlmICghIGNvbG9ycykge1xuICAgIHN0eWxpemUgPSBmdW5jdGlvbihzdHIsIHN0eWxlVHlwZSkgeyByZXR1cm4gc3RyOyB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0KHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gICAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZS5pbnNwZWN0ID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgICB2YWx1ZSAhPT0gZXhwb3J0cyAmJlxuICAgICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzKTtcbiAgICB9XG5cbiAgICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICBjYXNlICd1bmRlZmluZWQnOlxuICAgICAgICByZXR1cm4gc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuXG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgICAgICByZXR1cm4gc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcblxuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgcmV0dXJuIHN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuXG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgcmV0dXJuIHN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgICB9XG4gICAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xuICAgIH1cblxuICAgIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgICB2YXIgdmlzaWJsZV9rZXlzID0gT2JqZWN0X2tleXModmFsdWUpO1xuICAgIHZhciBrZXlzID0gc2hvd0hpZGRlbiA/IE9iamVjdF9nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKSA6IHZpc2libGVfa2V5cztcblxuICAgIC8vIEZ1bmN0aW9ucyB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgJiYga2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHN0eWxpemUoJycgKyB2YWx1ZSwgJ3JlZ2V4cCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgICAgcmV0dXJuIHN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERhdGVzIHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWRcbiAgICBpZiAoaXNEYXRlKHZhbHVlKSAmJiBrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHN0eWxpemUodmFsdWUudG9VVENTdHJpbmcoKSwgJ2RhdGUnKTtcbiAgICB9XG5cbiAgICB2YXIgYmFzZSwgdHlwZSwgYnJhY2VzO1xuICAgIC8vIERldGVybWluZSB0aGUgb2JqZWN0IHR5cGVcbiAgICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHR5cGUgPSAnQXJyYXknO1xuICAgICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHlwZSA9ICdPYmplY3QnO1xuICAgICAgYnJhY2VzID0gWyd7JywgJ30nXTtcbiAgICB9XG5cbiAgICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgYmFzZSA9IChpc1JlZ0V4cCh2YWx1ZSkpID8gJyAnICsgdmFsdWUgOiAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICAgIH0gZWxzZSB7XG4gICAgICBiYXNlID0gJyc7XG4gICAgfVxuXG4gICAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIGJhc2UgPSAnICcgKyB2YWx1ZS50b1VUQ1N0cmluZygpO1xuICAgIH1cblxuICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gICAgfVxuXG4gICAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHN0eWxpemUoJycgKyB2YWx1ZSwgJ3JlZ2V4cCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWVuLnB1c2godmFsdWUpO1xuXG4gICAgdmFyIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgdmFyIG5hbWUsIHN0cjtcbiAgICAgIGlmICh2YWx1ZS5fX2xvb2t1cEdldHRlcl9fKSB7XG4gICAgICAgIGlmICh2YWx1ZS5fX2xvb2t1cEdldHRlcl9fKGtleSkpIHtcbiAgICAgICAgICBpZiAodmFsdWUuX19sb29rdXBTZXR0ZXJfXyhrZXkpKSB7XG4gICAgICAgICAgICBzdHIgPSBzdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHIgPSBzdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh2YWx1ZS5fX2xvb2t1cFNldHRlcl9fKGtleSkpIHtcbiAgICAgICAgICAgIHN0ciA9IHN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh2aXNpYmxlX2tleXMuaW5kZXhPZihrZXkpIDwgMCkge1xuICAgICAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICAgICAgfVxuICAgICAgaWYgKCFzdHIpIHtcbiAgICAgICAgaWYgKHNlZW4uaW5kZXhPZih2YWx1ZVtrZXldKSA8IDApIHtcbiAgICAgICAgICBpZiAocmVjdXJzZVRpbWVzID09PSBudWxsKSB7XG4gICAgICAgICAgICBzdHIgPSBmb3JtYXQodmFsdWVba2V5XSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0ciA9IGZvcm1hdCh2YWx1ZVtrZXldLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgICAgICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9IHN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmICh0eXBlID09PSAnQXJyYXknICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICB9XG4gICAgICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgICAgIG5hbWUgPSBzdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgICAgICBuYW1lID0gc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xuICAgIH0pO1xuXG4gICAgc2Vlbi5wb3AoKTtcblxuICAgIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gICAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgICBudW1MaW5lc0VzdCsrO1xuICAgICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgICAgcmV0dXJuIHByZXYgKyBjdXIubGVuZ3RoICsgMTtcbiAgICB9LCAwKTtcblxuICAgIGlmIChsZW5ndGggPiA1MCkge1xuICAgICAgb3V0cHV0ID0gYnJhY2VzWzBdICtcbiAgICAgICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICAgICAnICcgK1xuICAgICAgICAgICAgICAgYnJhY2VzWzFdO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dCA9IGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG4gIHJldHVybiBmb3JtYXQob2JqLCAodHlwZW9mIGRlcHRoID09PSAndW5kZWZpbmVkJyA/IDIgOiBkZXB0aCkpO1xufTtcblxuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKSB8fFxuICAgICAgICAgKHR5cGVvZiBhciA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyKSA9PT0gJ1tvYmplY3QgQXJyYXldJyk7XG59XG5cblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgdHlwZW9mIHJlID09PSAnb2JqZWN0JyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cblxuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gdHlwZW9mIGQgPT09ICdvYmplY3QnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbiAobXNnKSB7fTtcblxuZXhwb3J0cy5wdW1wID0gbnVsbDtcblxudmFyIE9iamVjdF9rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSByZXMucHVzaChrZXkpO1xuICAgIHJldHVybiByZXM7XG59O1xuXG52YXIgT2JqZWN0X2dldE93blByb3BlcnR5TmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgcmVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn07XG5cbnZhciBPYmplY3RfY3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiAocHJvdG90eXBlLCBwcm9wZXJ0aWVzKSB7XG4gICAgLy8gZnJvbSBlczUtc2hpbVxuICAgIHZhciBvYmplY3Q7XG4gICAgaWYgKHByb3RvdHlwZSA9PT0gbnVsbCkge1xuICAgICAgICBvYmplY3QgPSB7ICdfX3Byb3RvX18nIDogbnVsbCB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwcm90b3R5cGUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgICAgICd0eXBlb2YgcHJvdG90eXBlWycgKyAodHlwZW9mIHByb3RvdHlwZSkgKyAnXSAhPSBcXCdvYmplY3RcXCcnXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHZhciBUeXBlID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgIFR5cGUucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgICAgICBvYmplY3QgPSBuZXcgVHlwZSgpO1xuICAgICAgICBvYmplY3QuX19wcm90b19fID0gcHJvdG90eXBlO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByb3BlcnRpZXMgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKG9iamVjdCwgcHJvcGVydGllcyk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG59O1xuXG5leHBvcnRzLmluaGVyaXRzID0gZnVuY3Rpb24oY3Rvciwgc3VwZXJDdG9yKSB7XG4gIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yO1xuICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdF9jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogY3RvcixcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xufTtcblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKHR5cGVvZiBmICE9PSAnc3RyaW5nJykge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChleHBvcnRzLmluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOiByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvcih2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pe1xuICAgIGlmICh4ID09PSBudWxsIHx8IHR5cGVvZiB4ICE9PSAnb2JqZWN0Jykge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBleHBvcnRzLmluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIGlmIChldi5zb3VyY2UgPT09IHdpbmRvdyAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCIvLyAgICAgVW5kZXJzY29yZS5qcyAxLjQuNFxuLy8gICAgIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnXG4vLyAgICAgKGMpIDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgSW5jLlxuLy8gICAgIFVuZGVyc2NvcmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5cbihmdW5jdGlvbigpIHtcblxuICAvLyBCYXNlbGluZSBzZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZ2xvYmFsYCBvbiB0aGUgc2VydmVyLlxuICB2YXIgcm9vdCA9IHRoaXM7XG5cbiAgLy8gU2F2ZSB0aGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGBfYCB2YXJpYWJsZS5cbiAgdmFyIHByZXZpb3VzVW5kZXJzY29yZSA9IHJvb3QuXztcblxuICAvLyBFc3RhYmxpc2ggdGhlIG9iamVjdCB0aGF0IGdldHMgcmV0dXJuZWQgdG8gYnJlYWsgb3V0IG9mIGEgbG9vcCBpdGVyYXRpb24uXG4gIHZhciBicmVha2VyID0ge307XG5cbiAgLy8gU2F2ZSBieXRlcyBpbiB0aGUgbWluaWZpZWQgKGJ1dCBub3QgZ3ppcHBlZCkgdmVyc2lvbjpcbiAgdmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGUsIE9ialByb3RvID0gT2JqZWN0LnByb3RvdHlwZSwgRnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4gIC8vIENyZWF0ZSBxdWljayByZWZlcmVuY2UgdmFyaWFibGVzIGZvciBzcGVlZCBhY2Nlc3MgdG8gY29yZSBwcm90b3R5cGVzLlxuICB2YXIgcHVzaCAgICAgICAgICAgICA9IEFycmF5UHJvdG8ucHVzaCxcbiAgICAgIHNsaWNlICAgICAgICAgICAgPSBBcnJheVByb3RvLnNsaWNlLFxuICAgICAgY29uY2F0ICAgICAgICAgICA9IEFycmF5UHJvdG8uY29uY2F0LFxuICAgICAgdG9TdHJpbmcgICAgICAgICA9IE9ialByb3RvLnRvU3RyaW5nLFxuICAgICAgaGFzT3duUHJvcGVydHkgICA9IE9ialByb3RvLmhhc093blByb3BlcnR5O1xuXG4gIC8vIEFsbCAqKkVDTUFTY3JpcHQgNSoqIG5hdGl2ZSBmdW5jdGlvbiBpbXBsZW1lbnRhdGlvbnMgdGhhdCB3ZSBob3BlIHRvIHVzZVxuICAvLyBhcmUgZGVjbGFyZWQgaGVyZS5cbiAgdmFyXG4gICAgbmF0aXZlRm9yRWFjaCAgICAgID0gQXJyYXlQcm90by5mb3JFYWNoLFxuICAgIG5hdGl2ZU1hcCAgICAgICAgICA9IEFycmF5UHJvdG8ubWFwLFxuICAgIG5hdGl2ZVJlZHVjZSAgICAgICA9IEFycmF5UHJvdG8ucmVkdWNlLFxuICAgIG5hdGl2ZVJlZHVjZVJpZ2h0ICA9IEFycmF5UHJvdG8ucmVkdWNlUmlnaHQsXG4gICAgbmF0aXZlRmlsdGVyICAgICAgID0gQXJyYXlQcm90by5maWx0ZXIsXG4gICAgbmF0aXZlRXZlcnkgICAgICAgID0gQXJyYXlQcm90by5ldmVyeSxcbiAgICBuYXRpdmVTb21lICAgICAgICAgPSBBcnJheVByb3RvLnNvbWUsXG4gICAgbmF0aXZlSW5kZXhPZiAgICAgID0gQXJyYXlQcm90by5pbmRleE9mLFxuICAgIG5hdGl2ZUxhc3RJbmRleE9mICA9IEFycmF5UHJvdG8ubGFzdEluZGV4T2YsXG4gICAgbmF0aXZlSXNBcnJheSAgICAgID0gQXJyYXkuaXNBcnJheSxcbiAgICBuYXRpdmVLZXlzICAgICAgICAgPSBPYmplY3Qua2V5cyxcbiAgICBuYXRpdmVCaW5kICAgICAgICAgPSBGdW5jUHJvdG8uYmluZDtcblxuICAvLyBDcmVhdGUgYSBzYWZlIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yIHVzZSBiZWxvdy5cbiAgdmFyIF8gPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgXykgcmV0dXJuIG9iajtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgXykpIHJldHVybiBuZXcgXyhvYmopO1xuICAgIHRoaXMuX3dyYXBwZWQgPSBvYmo7XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgKipOb2RlLmpzKiosIHdpdGhcbiAgLy8gYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIHRoZSBvbGQgYHJlcXVpcmUoKWAgQVBJLiBJZiB3ZSdyZSBpblxuICAvLyB0aGUgYnJvd3NlciwgYWRkIGBfYCBhcyBhIGdsb2JhbCBvYmplY3QgdmlhIGEgc3RyaW5nIGlkZW50aWZpZXIsXG4gIC8vIGZvciBDbG9zdXJlIENvbXBpbGVyIFwiYWR2YW5jZWRcIiBtb2RlLlxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBfO1xuICAgIH1cbiAgICBleHBvcnRzLl8gPSBfO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuXyA9IF87XG4gIH1cblxuICAvLyBDdXJyZW50IHZlcnNpb24uXG4gIF8uVkVSU0lPTiA9ICcxLjQuNCc7XG5cbiAgLy8gQ29sbGVjdGlvbiBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBUaGUgY29ybmVyc3RvbmUsIGFuIGBlYWNoYCBpbXBsZW1lbnRhdGlvbiwgYWthIGBmb3JFYWNoYC5cbiAgLy8gSGFuZGxlcyBvYmplY3RzIHdpdGggdGhlIGJ1aWx0LWluIGBmb3JFYWNoYCwgYXJyYXlzLCBhbmQgcmF3IG9iamVjdHMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBmb3JFYWNoYCBpZiBhdmFpbGFibGUuXG4gIHZhciBlYWNoID0gXy5lYWNoID0gXy5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuO1xuICAgIGlmIChuYXRpdmVGb3JFYWNoICYmIG9iai5mb3JFYWNoID09PSBuYXRpdmVGb3JFYWNoKSB7XG4gICAgICBvYmouZm9yRWFjaChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKSA9PT0gYnJlYWtlcikgcmV0dXJuO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChfLmhhcyhvYmosIGtleSkpIHtcbiAgICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpba2V5XSwga2V5LCBvYmopID09PSBicmVha2VyKSByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRvciB0byBlYWNoIGVsZW1lbnQuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBtYXBgIGlmIGF2YWlsYWJsZS5cbiAgXy5tYXAgPSBfLmNvbGxlY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHRzO1xuICAgIGlmIChuYXRpdmVNYXAgJiYgb2JqLm1hcCA9PT0gbmF0aXZlTWFwKSByZXR1cm4gb2JqLm1hcChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmVzdWx0c1tyZXN1bHRzLmxlbmd0aF0gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgdmFyIHJlZHVjZUVycm9yID0gJ1JlZHVjZSBvZiBlbXB0eSBhcnJheSB3aXRoIG5vIGluaXRpYWwgdmFsdWUnO1xuXG4gIC8vICoqUmVkdWNlKiogYnVpbGRzIHVwIGEgc2luZ2xlIHJlc3VsdCBmcm9tIGEgbGlzdCBvZiB2YWx1ZXMsIGFrYSBgaW5qZWN0YCxcbiAgLy8gb3IgYGZvbGRsYC4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYHJlZHVjZWAgaWYgYXZhaWxhYmxlLlxuICBfLnJlZHVjZSA9IF8uZm9sZGwgPSBfLmluamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIG1lbW8sIGNvbnRleHQpIHtcbiAgICB2YXIgaW5pdGlhbCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyO1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaWYgKG5hdGl2ZVJlZHVjZSAmJiBvYmoucmVkdWNlID09PSBuYXRpdmVSZWR1Y2UpIHtcbiAgICAgIGlmIChjb250ZXh0KSBpdGVyYXRvciA9IF8uYmluZChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgICByZXR1cm4gaW5pdGlhbCA/IG9iai5yZWR1Y2UoaXRlcmF0b3IsIG1lbW8pIDogb2JqLnJlZHVjZShpdGVyYXRvcik7XG4gICAgfVxuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmICghaW5pdGlhbCkge1xuICAgICAgICBtZW1vID0gdmFsdWU7XG4gICAgICAgIGluaXRpYWwgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVtbyA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgbWVtbywgdmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWluaXRpYWwpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFRoZSByaWdodC1hc3NvY2lhdGl2ZSB2ZXJzaW9uIG9mIHJlZHVjZSwgYWxzbyBrbm93biBhcyBgZm9sZHJgLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgcmVkdWNlUmlnaHRgIGlmIGF2YWlsYWJsZS5cbiAgXy5yZWR1Y2VSaWdodCA9IF8uZm9sZHIgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgdmFyIGluaXRpYWwgPSBhcmd1bWVudHMubGVuZ3RoID4gMjtcbiAgICBpZiAob2JqID09IG51bGwpIG9iaiA9IFtdO1xuICAgIGlmIChuYXRpdmVSZWR1Y2VSaWdodCAmJiBvYmoucmVkdWNlUmlnaHQgPT09IG5hdGl2ZVJlZHVjZVJpZ2h0KSB7XG4gICAgICBpZiAoY29udGV4dCkgaXRlcmF0b3IgPSBfLmJpbmQoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgICAgcmV0dXJuIGluaXRpYWwgPyBvYmoucmVkdWNlUmlnaHQoaXRlcmF0b3IsIG1lbW8pIDogb2JqLnJlZHVjZVJpZ2h0KGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IG9iai5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCAhPT0gK2xlbmd0aCkge1xuICAgICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIH1cbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpbmRleCA9IGtleXMgPyBrZXlzWy0tbGVuZ3RoXSA6IC0tbGVuZ3RoO1xuICAgICAgaWYgKCFpbml0aWFsKSB7XG4gICAgICAgIG1lbW8gPSBvYmpbaW5kZXhdO1xuICAgICAgICBpbml0aWFsID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbW8gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG1lbW8sIG9ialtpbmRleF0sIGluZGV4LCBsaXN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWluaXRpYWwpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgZmlyc3QgdmFsdWUgd2hpY2ggcGFzc2VzIGEgdHJ1dGggdGVzdC4gQWxpYXNlZCBhcyBgZGV0ZWN0YC5cbiAgXy5maW5kID0gXy5kZXRlY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdDtcbiAgICBhbnkob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpIHtcbiAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgdGhhdCBwYXNzIGEgdHJ1dGggdGVzdC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGZpbHRlcmAgaWYgYXZhaWxhYmxlLlxuICAvLyBBbGlhc2VkIGFzIGBzZWxlY3RgLlxuICBfLmZpbHRlciA9IF8uc2VsZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0cztcbiAgICBpZiAobmF0aXZlRmlsdGVyICYmIG9iai5maWx0ZXIgPT09IG5hdGl2ZUZpbHRlcikgcmV0dXJuIG9iai5maWx0ZXIoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHNbcmVzdWx0cy5sZW5ndGhdID0gdmFsdWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgZm9yIHdoaWNoIGEgdHJ1dGggdGVzdCBmYWlscy5cbiAgXy5yZWplY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXR1cm4gIWl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICB9LCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgd2hldGhlciBhbGwgb2YgdGhlIGVsZW1lbnRzIG1hdGNoIGEgdHJ1dGggdGVzdC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGV2ZXJ5YCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYGFsbGAuXG4gIF8uZXZlcnkgPSBfLmFsbCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRvciB8fCAoaXRlcmF0b3IgPSBfLmlkZW50aXR5KTtcbiAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKG5hdGl2ZUV2ZXJ5ICYmIG9iai5ldmVyeSA9PT0gbmF0aXZlRXZlcnkpIHJldHVybiBvYmouZXZlcnkoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmICghKHJlc3VsdCA9IHJlc3VsdCAmJiBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpKSByZXR1cm4gYnJlYWtlcjtcbiAgICB9KTtcbiAgICByZXR1cm4gISFyZXN1bHQ7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIGF0IGxlYXN0IG9uZSBlbGVtZW50IGluIHRoZSBvYmplY3QgbWF0Y2hlcyBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBzb21lYCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYGFueWAuXG4gIHZhciBhbnkgPSBfLnNvbWUgPSBfLmFueSA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRvciB8fCAoaXRlcmF0b3IgPSBfLmlkZW50aXR5KTtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChuYXRpdmVTb21lICYmIG9iai5zb21lID09PSBuYXRpdmVTb21lKSByZXR1cm4gb2JqLnNvbWUoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChyZXN1bHQgfHwgKHJlc3VsdCA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkpIHJldHVybiBicmVha2VyO1xuICAgIH0pO1xuICAgIHJldHVybiAhIXJlc3VsdDtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgdGhlIGFycmF5IG9yIG9iamVjdCBjb250YWlucyBhIGdpdmVuIHZhbHVlICh1c2luZyBgPT09YCkuXG4gIC8vIEFsaWFzZWQgYXMgYGluY2x1ZGVgLlxuICBfLmNvbnRhaW5zID0gXy5pbmNsdWRlID0gZnVuY3Rpb24ob2JqLCB0YXJnZXQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICBpZiAobmF0aXZlSW5kZXhPZiAmJiBvYmouaW5kZXhPZiA9PT0gbmF0aXZlSW5kZXhPZikgcmV0dXJuIG9iai5pbmRleE9mKHRhcmdldCkgIT0gLTE7XG4gICAgcmV0dXJuIGFueShvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IHRhcmdldDtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBJbnZva2UgYSBtZXRob2QgKHdpdGggYXJndW1lbnRzKSBvbiBldmVyeSBpdGVtIGluIGEgY29sbGVjdGlvbi5cbiAgXy5pbnZva2UgPSBmdW5jdGlvbihvYmosIG1ldGhvZCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHZhciBpc0Z1bmMgPSBfLmlzRnVuY3Rpb24obWV0aG9kKTtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIChpc0Z1bmMgPyBtZXRob2QgOiB2YWx1ZVttZXRob2RdKS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgbWFwYDogZmV0Y2hpbmcgYSBwcm9wZXJ0eS5cbiAgXy5wbHVjayA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUpeyByZXR1cm4gdmFsdWVba2V5XTsgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmlsdGVyYDogc2VsZWN0aW5nIG9ubHkgb2JqZWN0c1xuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLndoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycywgZmlyc3QpIHtcbiAgICBpZiAoXy5pc0VtcHR5KGF0dHJzKSkgcmV0dXJuIGZpcnN0ID8gbnVsbCA6IFtdO1xuICAgIHJldHVybiBfW2ZpcnN0ID8gJ2ZpbmQnIDogJ2ZpbHRlciddKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBhdHRycykge1xuICAgICAgICBpZiAoYXR0cnNba2V5XSAhPT0gdmFsdWVba2V5XSkgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmluZGA6IGdldHRpbmcgdGhlIGZpcnN0IG9iamVjdFxuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmZpbmRXaGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy53aGVyZShvYmosIGF0dHJzLCB0cnVlKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCBvciAoZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIC8vIENhbid0IG9wdGltaXplIGFycmF5cyBvZiBpbnRlZ2VycyBsb25nZXIgdGhhbiA2NSw1MzUgZWxlbWVudHMuXG4gIC8vIFNlZTogaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTgwNzk3XG4gIF8ubWF4ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmICghaXRlcmF0b3IgJiYgXy5pc0FycmF5KG9iaikgJiYgb2JqWzBdID09PSArb2JqWzBdICYmIG9iai5sZW5ndGggPCA2NTUzNSkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KE1hdGgsIG9iaik7XG4gICAgfVxuICAgIGlmICghaXRlcmF0b3IgJiYgXy5pc0VtcHR5KG9iaikpIHJldHVybiAtSW5maW5pdHk7XG4gICAgdmFyIHJlc3VsdCA9IHtjb21wdXRlZCA6IC1JbmZpbml0eSwgdmFsdWU6IC1JbmZpbml0eX07XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgdmFyIGNvbXB1dGVkID0gaXRlcmF0b3IgPyBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkgOiB2YWx1ZTtcbiAgICAgIGNvbXB1dGVkID49IHJlc3VsdC5jb21wdXRlZCAmJiAocmVzdWx0ID0ge3ZhbHVlIDogdmFsdWUsIGNvbXB1dGVkIDogY29tcHV0ZWR9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0LnZhbHVlO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWluaW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5taW4gPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFpdGVyYXRvciAmJiBfLmlzQXJyYXkob2JqKSAmJiBvYmpbMF0gPT09ICtvYmpbMF0gJiYgb2JqLmxlbmd0aCA8IDY1NTM1KSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4uYXBwbHkoTWF0aCwgb2JqKTtcbiAgICB9XG4gICAgaWYgKCFpdGVyYXRvciAmJiBfLmlzRW1wdHkob2JqKSkgcmV0dXJuIEluZmluaXR5O1xuICAgIHZhciByZXN1bHQgPSB7Y29tcHV0ZWQgOiBJbmZpbml0eSwgdmFsdWU6IEluZmluaXR5fTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICB2YXIgY29tcHV0ZWQgPSBpdGVyYXRvciA/IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSA6IHZhbHVlO1xuICAgICAgY29tcHV0ZWQgPCByZXN1bHQuY29tcHV0ZWQgJiYgKHJlc3VsdCA9IHt2YWx1ZSA6IHZhbHVlLCBjb21wdXRlZCA6IGNvbXB1dGVkfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdC52YWx1ZTtcbiAgfTtcblxuICAvLyBTaHVmZmxlIGFuIGFycmF5LlxuICBfLnNodWZmbGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgcmFuZDtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzaHVmZmxlZCA9IFtdO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmFuZCA9IF8ucmFuZG9tKGluZGV4KyspO1xuICAgICAgc2h1ZmZsZWRbaW5kZXggLSAxXSA9IHNodWZmbGVkW3JhbmRdO1xuICAgICAgc2h1ZmZsZWRbcmFuZF0gPSB2YWx1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gc2h1ZmZsZWQ7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgbG9va3VwIGl0ZXJhdG9ycy5cbiAgdmFyIGxvb2t1cEl0ZXJhdG9yID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKHZhbHVlKSA/IHZhbHVlIDogZnVuY3Rpb24ob2JqKXsgcmV0dXJuIG9ialt2YWx1ZV07IH07XG4gIH07XG5cbiAgLy8gU29ydCB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uIHByb2R1Y2VkIGJ5IGFuIGl0ZXJhdG9yLlxuICBfLnNvcnRCeSA9IGZ1bmN0aW9uKG9iaiwgdmFsdWUsIGNvbnRleHQpIHtcbiAgICB2YXIgaXRlcmF0b3IgPSBsb29rdXBJdGVyYXRvcih2YWx1ZSk7XG4gICAgcmV0dXJuIF8ucGx1Y2soXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlIDogdmFsdWUsXG4gICAgICAgIGluZGV4IDogaW5kZXgsXG4gICAgICAgIGNyaXRlcmlhIDogaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpXG4gICAgICB9O1xuICAgIH0pLnNvcnQoZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgIHZhciBhID0gbGVmdC5jcml0ZXJpYTtcbiAgICAgIHZhciBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICBpZiAoYSAhPT0gYikge1xuICAgICAgICBpZiAoYSA+IGIgfHwgYSA9PT0gdm9pZCAwKSByZXR1cm4gMTtcbiAgICAgICAgaWYgKGEgPCBiIHx8IGIgPT09IHZvaWQgMCkgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxlZnQuaW5kZXggPCByaWdodC5pbmRleCA/IC0xIDogMTtcbiAgICB9KSwgJ3ZhbHVlJyk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdXNlZCBmb3IgYWdncmVnYXRlIFwiZ3JvdXAgYnlcIiBvcGVyYXRpb25zLlxuICB2YXIgZ3JvdXAgPSBmdW5jdGlvbihvYmosIHZhbHVlLCBjb250ZXh0LCBiZWhhdmlvcikge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICB2YXIgaXRlcmF0b3IgPSBsb29rdXBJdGVyYXRvcih2YWx1ZSB8fCBfLmlkZW50aXR5KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICB2YXIga2V5ID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIG9iaik7XG4gICAgICBiZWhhdmlvcihyZXN1bHQsIGtleSwgdmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gR3JvdXBzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24uIFBhc3MgZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZVxuICAvLyB0byBncm91cCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGNyaXRlcmlvbi5cbiAgXy5ncm91cEJ5ID0gZnVuY3Rpb24ob2JqLCB2YWx1ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBncm91cChvYmosIHZhbHVlLCBjb250ZXh0LCBmdW5jdGlvbihyZXN1bHQsIGtleSwgdmFsdWUpIHtcbiAgICAgIChfLmhhcyhyZXN1bHQsIGtleSkgPyByZXN1bHRba2V5XSA6IChyZXN1bHRba2V5XSA9IFtdKSkucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ291bnRzIGluc3RhbmNlcyBvZiBhbiBvYmplY3QgdGhhdCBncm91cCBieSBhIGNlcnRhaW4gY3JpdGVyaW9uLiBQYXNzXG4gIC8vIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGUgdG8gY291bnQgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAvLyBjcml0ZXJpb24uXG4gIF8uY291bnRCeSA9IGZ1bmN0aW9uKG9iaiwgdmFsdWUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gZ3JvdXAob2JqLCB2YWx1ZSwgY29udGV4dCwgZnVuY3Rpb24ocmVzdWx0LCBrZXkpIHtcbiAgICAgIGlmICghXy5oYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XSA9IDA7XG4gICAgICByZXN1bHRba2V5XSsrO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIFVzZSBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gdG8gZmlndXJlIG91dCB0aGUgc21hbGxlc3QgaW5kZXggYXQgd2hpY2hcbiAgLy8gYW4gb2JqZWN0IHNob3VsZCBiZSBpbnNlcnRlZCBzbyBhcyB0byBtYWludGFpbiBvcmRlci4gVXNlcyBiaW5hcnkgc2VhcmNoLlxuICBfLnNvcnRlZEluZGV4ID0gZnVuY3Rpb24oYXJyYXksIG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRvciA9IGl0ZXJhdG9yID09IG51bGwgPyBfLmlkZW50aXR5IDogbG9va3VwSXRlcmF0b3IoaXRlcmF0b3IpO1xuICAgIHZhciB2YWx1ZSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqKTtcbiAgICB2YXIgbG93ID0gMCwgaGlnaCA9IGFycmF5Lmxlbmd0aDtcbiAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgdmFyIG1pZCA9IChsb3cgKyBoaWdoKSA+Pj4gMTtcbiAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgYXJyYXlbbWlkXSkgPCB2YWx1ZSA/IGxvdyA9IG1pZCArIDEgOiBoaWdoID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG93O1xuICB9O1xuXG4gIC8vIFNhZmVseSBjb252ZXJ0IGFueXRoaW5nIGl0ZXJhYmxlIGludG8gYSByZWFsLCBsaXZlIGFycmF5LlxuICBfLnRvQXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIW9iaikgcmV0dXJuIFtdO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSkgcmV0dXJuIHNsaWNlLmNhbGwob2JqKTtcbiAgICBpZiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpIHJldHVybiBfLm1hcChvYmosIF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBfLnZhbHVlcyhvYmopO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIGFuIG9iamVjdC5cbiAgXy5zaXplID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gMDtcbiAgICByZXR1cm4gKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSA/IG9iai5sZW5ndGggOiBfLmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgLy8gQXJyYXkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgZmlyc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBBbGlhc2VkIGFzIGBoZWFkYCBhbmQgYHRha2VgLiBUaGUgKipndWFyZCoqIGNoZWNrXG4gIC8vIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5maXJzdCA9IF8uaGVhZCA9IF8udGFrZSA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIHJldHVybiAobiAhPSBudWxsKSAmJiAhZ3VhcmQgPyBzbGljZS5jYWxsKGFycmF5LCAwLCBuKSA6IGFycmF5WzBdO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGxhc3QgZW50cnkgb2YgdGhlIGFycmF5LiBFc3BlY2lhbGx5IHVzZWZ1bCBvblxuICAvLyB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiBhbGwgdGhlIHZhbHVlcyBpblxuICAvLyB0aGUgYXJyYXksIGV4Y2x1ZGluZyB0aGUgbGFzdCBOLiBUaGUgKipndWFyZCoqIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGhcbiAgLy8gYF8ubWFwYC5cbiAgXy5pbml0aWFsID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIDAsIGFycmF5Lmxlbmd0aCAtICgobiA9PSBudWxsKSB8fCBndWFyZCA/IDEgOiBuKSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGxhc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBUaGUgKipndWFyZCoqIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5sYXN0ID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgaWYgKChuICE9IG51bGwpICYmICFndWFyZCkge1xuICAgICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIE1hdGgubWF4KGFycmF5Lmxlbmd0aCAtIG4sIDApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYHRhaWxgIGFuZCBgZHJvcGAuXG4gIC8vIEVzcGVjaWFsbHkgdXNlZnVsIG9uIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nIGFuICoqbioqIHdpbGwgcmV0dXJuXG4gIC8vIHRoZSByZXN0IE4gdmFsdWVzIGluIHRoZSBhcnJheS4gVGhlICoqZ3VhcmQqKlxuICAvLyBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8ucmVzdCA9IF8udGFpbCA9IF8uZHJvcCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAobiA9PSBudWxsKSB8fCBndWFyZCA/IDEgOiBuKTtcbiAgfTtcblxuICAvLyBUcmltIG91dCBhbGwgZmFsc3kgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG4gIF8uY29tcGFjdCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBfLmlkZW50aXR5KTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBpbXBsZW1lbnRhdGlvbiBvZiBhIHJlY3Vyc2l2ZSBgZmxhdHRlbmAgZnVuY3Rpb24uXG4gIHZhciBmbGF0dGVuID0gZnVuY3Rpb24oaW5wdXQsIHNoYWxsb3csIG91dHB1dCkge1xuICAgIGVhY2goaW5wdXQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICBzaGFsbG93ID8gcHVzaC5hcHBseShvdXRwdXQsIHZhbHVlKSA6IGZsYXR0ZW4odmFsdWUsIHNoYWxsb3csIG91dHB1dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXRwdXQucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBjb21wbGV0ZWx5IGZsYXR0ZW5lZCB2ZXJzaW9uIG9mIGFuIGFycmF5LlxuICBfLmZsYXR0ZW4gPSBmdW5jdGlvbihhcnJheSwgc2hhbGxvdykge1xuICAgIHJldHVybiBmbGF0dGVuKGFycmF5LCBzaGFsbG93LCBbXSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGUgYXJyYXkgdGhhdCBkb2VzIG5vdCBjb250YWluIHRoZSBzcGVjaWZpZWQgdmFsdWUocykuXG4gIF8ud2l0aG91dCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZGlmZmVyZW5jZShhcnJheSwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGEgZHVwbGljYXRlLWZyZWUgdmVyc2lvbiBvZiB0aGUgYXJyYXkuIElmIHRoZSBhcnJheSBoYXMgYWxyZWFkeVxuICAvLyBiZWVuIHNvcnRlZCwgeW91IGhhdmUgdGhlIG9wdGlvbiBvZiB1c2luZyBhIGZhc3RlciBhbGdvcml0aG0uXG4gIC8vIEFsaWFzZWQgYXMgYHVuaXF1ZWAuXG4gIF8udW5pcSA9IF8udW5pcXVlID0gZnVuY3Rpb24oYXJyYXksIGlzU29ydGVkLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmIChfLmlzRnVuY3Rpb24oaXNTb3J0ZWQpKSB7XG4gICAgICBjb250ZXh0ID0gaXRlcmF0b3I7XG4gICAgICBpdGVyYXRvciA9IGlzU29ydGVkO1xuICAgICAgaXNTb3J0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGluaXRpYWwgPSBpdGVyYXRvciA/IF8ubWFwKGFycmF5LCBpdGVyYXRvciwgY29udGV4dCkgOiBhcnJheTtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIHZhciBzZWVuID0gW107XG4gICAgZWFjaChpbml0aWFsLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgIGlmIChpc1NvcnRlZCA/ICghaW5kZXggfHwgc2VlbltzZWVuLmxlbmd0aCAtIDFdICE9PSB2YWx1ZSkgOiAhXy5jb250YWlucyhzZWVuLCB2YWx1ZSkpIHtcbiAgICAgICAgc2Vlbi5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGFycmF5W2luZGV4XSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB1bmlvbjogZWFjaCBkaXN0aW5jdCBlbGVtZW50IGZyb20gYWxsIG9mXG4gIC8vIHRoZSBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLnVuaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8udW5pcShjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgYXJndW1lbnRzKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIGV2ZXJ5IGl0ZW0gc2hhcmVkIGJldHdlZW4gYWxsIHRoZVxuICAvLyBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLmludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3QgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIF8uZmlsdGVyKF8udW5pcShhcnJheSksIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHJldHVybiBfLmV2ZXJ5KHJlc3QsIGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBfLmluZGV4T2Yob3RoZXIsIGl0ZW0pID49IDA7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBUYWtlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gb25lIGFycmF5IGFuZCBhIG51bWJlciBvZiBvdGhlciBhcnJheXMuXG4gIC8vIE9ubHkgdGhlIGVsZW1lbnRzIHByZXNlbnQgaW4ganVzdCB0aGUgZmlyc3QgYXJyYXkgd2lsbCByZW1haW4uXG4gIF8uZGlmZmVyZW5jZSA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3QgPSBjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKXsgcmV0dXJuICFfLmNvbnRhaW5zKHJlc3QsIHZhbHVlKTsgfSk7XG4gIH07XG5cbiAgLy8gWmlwIHRvZ2V0aGVyIG11bHRpcGxlIGxpc3RzIGludG8gYSBzaW5nbGUgYXJyYXkgLS0gZWxlbWVudHMgdGhhdCBzaGFyZVxuICAvLyBhbiBpbmRleCBnbyB0b2dldGhlci5cbiAgXy56aXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICB2YXIgbGVuZ3RoID0gXy5tYXgoXy5wbHVjayhhcmdzLCAnbGVuZ3RoJykpO1xuICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0c1tpXSA9IF8ucGx1Y2soYXJncywgXCJcIiArIGkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gIF8ub2JqZWN0ID0gZnVuY3Rpb24obGlzdCwgdmFsdWVzKSB7XG4gICAgaWYgKGxpc3QgPT0gbnVsbCkgcmV0dXJuIHt9O1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldXSA9IHZhbHVlc1tpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldWzBdXSA9IGxpc3RbaV1bMV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gSWYgdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwbHkgdXMgd2l0aCBpbmRleE9mIChJJ20gbG9va2luZyBhdCB5b3UsICoqTVNJRSoqKSxcbiAgLy8gd2UgbmVlZCB0aGlzIGZ1bmN0aW9uLiBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuXG4gIC8vIGl0ZW0gaW4gYW4gYXJyYXksIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBpbmRleE9mYCBpZiBhdmFpbGFibGUuXG4gIC8vIElmIHRoZSBhcnJheSBpcyBsYXJnZSBhbmQgYWxyZWFkeSBpbiBzb3J0IG9yZGVyLCBwYXNzIGB0cnVlYFxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuICBfLmluZGV4T2YgPSBmdW5jdGlvbihhcnJheSwgaXRlbSwgaXNTb3J0ZWQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIHZhciBpID0gMCwgbCA9IGFycmF5Lmxlbmd0aDtcbiAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgaXNTb3J0ZWQgPT0gJ251bWJlcicpIHtcbiAgICAgICAgaSA9IChpc1NvcnRlZCA8IDAgPyBNYXRoLm1heCgwLCBsICsgaXNTb3J0ZWQpIDogaXNTb3J0ZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaSA9IF8uc29ydGVkSW5kZXgoYXJyYXksIGl0ZW0pO1xuICAgICAgICByZXR1cm4gYXJyYXlbaV0gPT09IGl0ZW0gPyBpIDogLTE7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChuYXRpdmVJbmRleE9mICYmIGFycmF5LmluZGV4T2YgPT09IG5hdGl2ZUluZGV4T2YpIHJldHVybiBhcnJheS5pbmRleE9mKGl0ZW0sIGlzU29ydGVkKTtcbiAgICBmb3IgKDsgaSA8IGw7IGkrKykgaWYgKGFycmF5W2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGxhc3RJbmRleE9mYCBpZiBhdmFpbGFibGUuXG4gIF8ubGFzdEluZGV4T2YgPSBmdW5jdGlvbihhcnJheSwgaXRlbSwgZnJvbSkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gLTE7XG4gICAgdmFyIGhhc0luZGV4ID0gZnJvbSAhPSBudWxsO1xuICAgIGlmIChuYXRpdmVMYXN0SW5kZXhPZiAmJiBhcnJheS5sYXN0SW5kZXhPZiA9PT0gbmF0aXZlTGFzdEluZGV4T2YpIHtcbiAgICAgIHJldHVybiBoYXNJbmRleCA/IGFycmF5Lmxhc3RJbmRleE9mKGl0ZW0sIGZyb20pIDogYXJyYXkubGFzdEluZGV4T2YoaXRlbSk7XG4gICAgfVxuICAgIHZhciBpID0gKGhhc0luZGV4ID8gZnJvbSA6IGFycmF5Lmxlbmd0aCk7XG4gICAgd2hpbGUgKGktLSkgaWYgKGFycmF5W2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgLy8gR2VuZXJhdGUgYW4gaW50ZWdlciBBcnJheSBjb250YWluaW5nIGFuIGFyaXRobWV0aWMgcHJvZ3Jlc3Npb24uIEEgcG9ydCBvZlxuICAvLyB0aGUgbmF0aXZlIFB5dGhvbiBgcmFuZ2UoKWAgZnVuY3Rpb24uIFNlZVxuICAvLyBbdGhlIFB5dGhvbiBkb2N1bWVudGF0aW9uXShodHRwOi8vZG9jcy5weXRob24ub3JnL2xpYnJhcnkvZnVuY3Rpb25zLmh0bWwjcmFuZ2UpLlxuICBfLnJhbmdlID0gZnVuY3Rpb24oc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8PSAxKSB7XG4gICAgICBzdG9wID0gc3RhcnQgfHwgMDtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgc3RlcCA9IGFyZ3VtZW50c1syXSB8fCAxO1xuXG4gICAgdmFyIGxlbiA9IE1hdGgubWF4KE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApLCAwKTtcbiAgICB2YXIgaWR4ID0gMDtcbiAgICB2YXIgcmFuZ2UgPSBuZXcgQXJyYXkobGVuKTtcblxuICAgIHdoaWxlKGlkeCA8IGxlbikge1xuICAgICAgcmFuZ2VbaWR4KytdID0gc3RhcnQ7XG4gICAgICBzdGFydCArPSBzdGVwO1xuICAgIH1cblxuICAgIHJldHVybiByYW5nZTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiAoYWhlbSkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIENyZWF0ZSBhIGZ1bmN0aW9uIGJvdW5kIHRvIGEgZ2l2ZW4gb2JqZWN0IChhc3NpZ25pbmcgYHRoaXNgLCBhbmQgYXJndW1lbnRzLFxuICAvLyBvcHRpb25hbGx5KS4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYEZ1bmN0aW9uLmJpbmRgIGlmXG4gIC8vIGF2YWlsYWJsZS5cbiAgXy5iaW5kID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCkge1xuICAgIGlmIChmdW5jLmJpbmQgPT09IG5hdGl2ZUJpbmQgJiYgbmF0aXZlQmluZCkgcmV0dXJuIG5hdGl2ZUJpbmQuYXBwbHkoZnVuYywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFBhcnRpYWxseSBhcHBseSBhIGZ1bmN0aW9uIGJ5IGNyZWF0aW5nIGEgdmVyc2lvbiB0aGF0IGhhcyBoYWQgc29tZSBvZiBpdHNcbiAgLy8gYXJndW1lbnRzIHByZS1maWxsZWQsIHdpdGhvdXQgY2hhbmdpbmcgaXRzIGR5bmFtaWMgYHRoaXNgIGNvbnRleHQuXG4gIF8ucGFydGlhbCA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEJpbmQgYWxsIG9mIGFuIG9iamVjdCdzIG1ldGhvZHMgdG8gdGhhdCBvYmplY3QuIFVzZWZ1bCBmb3IgZW5zdXJpbmcgdGhhdFxuICAvLyBhbGwgY2FsbGJhY2tzIGRlZmluZWQgb24gYW4gb2JqZWN0IGJlbG9uZyB0byBpdC5cbiAgXy5iaW5kQWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGZ1bmNzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGlmIChmdW5jcy5sZW5ndGggPT09IDApIGZ1bmNzID0gXy5mdW5jdGlvbnMob2JqKTtcbiAgICBlYWNoKGZ1bmNzLCBmdW5jdGlvbihmKSB7IG9ialtmXSA9IF8uYmluZChvYmpbZl0sIG9iaik7IH0pO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gTWVtb2l6ZSBhbiBleHBlbnNpdmUgZnVuY3Rpb24gYnkgc3RvcmluZyBpdHMgcmVzdWx0cy5cbiAgXy5tZW1vaXplID0gZnVuY3Rpb24oZnVuYywgaGFzaGVyKSB7XG4gICAgdmFyIG1lbW8gPSB7fTtcbiAgICBoYXNoZXIgfHwgKGhhc2hlciA9IF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBrZXkgPSBoYXNoZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBfLmhhcyhtZW1vLCBrZXkpID8gbWVtb1trZXldIDogKG1lbW9ba2V5XSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBEZWxheXMgYSBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIGFuZCB0aGVuIGNhbGxzXG4gIC8vIGl0IHdpdGggdGhlIGFyZ3VtZW50cyBzdXBwbGllZC5cbiAgXy5kZWxheSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpeyByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmdzKTsgfSwgd2FpdCk7XG4gIH07XG5cbiAgLy8gRGVmZXJzIGEgZnVuY3Rpb24sIHNjaGVkdWxpbmcgaXQgdG8gcnVuIGFmdGVyIHRoZSBjdXJyZW50IGNhbGwgc3RhY2sgaGFzXG4gIC8vIGNsZWFyZWQuXG4gIF8uZGVmZXIgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgcmV0dXJuIF8uZGVsYXkuYXBwbHkoXywgW2Z1bmMsIDFdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIHdoZW4gaW52b2tlZCwgd2lsbCBvbmx5IGJlIHRyaWdnZXJlZCBhdCBtb3N0IG9uY2VcbiAgLy8gZHVyaW5nIGEgZ2l2ZW4gd2luZG93IG9mIHRpbWUuXG4gIF8udGhyb3R0bGUgPSBmdW5jdGlvbihmdW5jLCB3YWl0KSB7XG4gICAgdmFyIGNvbnRleHQsIGFyZ3MsIHRpbWVvdXQsIHJlc3VsdDtcbiAgICB2YXIgcHJldmlvdXMgPSAwO1xuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcHJldmlvdXMgPSBuZXcgRGF0ZTtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBub3cgPSBuZXcgRGF0ZTtcbiAgICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGlmIChyZW1haW5pbmcgPD0gMCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBwcmV2aW91cyA9IG5vdztcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCBhcyBsb25nIGFzIGl0IGNvbnRpbnVlcyB0byBiZSBpbnZva2VkLCB3aWxsIG5vdFxuICAvLyBiZSB0cmlnZ2VyZWQuIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBhZnRlciBpdCBzdG9wcyBiZWluZyBjYWxsZWQgZm9yXG4gIC8vIE4gbWlsbGlzZWNvbmRzLiBJZiBgaW1tZWRpYXRlYCBpcyBwYXNzZWQsIHRyaWdnZXIgdGhlIGZ1bmN0aW9uIG9uIHRoZVxuICAvLyBsZWFkaW5nIGVkZ2UsIGluc3RlYWQgb2YgdGhlIHRyYWlsaW5nLlxuICBfLmRlYm91bmNlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgdmFyIHRpbWVvdXQsIHJlc3VsdDtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGlmICghaW1tZWRpYXRlKSByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgfTtcbiAgICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgICAgaWYgKGNhbGxOb3cpIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCBtb3N0IG9uZSB0aW1lLCBubyBtYXR0ZXIgaG93XG4gIC8vIG9mdGVuIHlvdSBjYWxsIGl0LiBVc2VmdWwgZm9yIGxhenkgaW5pdGlhbGl6YXRpb24uXG4gIF8ub25jZSA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB2YXIgcmFuID0gZmFsc2UsIG1lbW87XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHJhbikgcmV0dXJuIG1lbW87XG4gICAgICByYW4gPSB0cnVlO1xuICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGZ1bmMgPSBudWxsO1xuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBmdW5jdGlvbiBwYXNzZWQgYXMgYW4gYXJndW1lbnQgdG8gdGhlIHNlY29uZCxcbiAgLy8gYWxsb3dpbmcgeW91IHRvIGFkanVzdCBhcmd1bWVudHMsIHJ1biBjb2RlIGJlZm9yZSBhbmQgYWZ0ZXIsIGFuZFxuICAvLyBjb25kaXRpb25hbGx5IGV4ZWN1dGUgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uLlxuICBfLndyYXAgPSBmdW5jdGlvbihmdW5jLCB3cmFwcGVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBbZnVuY107XG4gICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gd3JhcHBlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGlzIHRoZSBjb21wb3NpdGlvbiBvZiBhIGxpc3Qgb2YgZnVuY3Rpb25zLCBlYWNoXG4gIC8vIGNvbnN1bWluZyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiB0aGF0IGZvbGxvd3MuXG4gIF8uY29tcG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmdW5jcyA9IGFyZ3VtZW50cztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGZvciAodmFyIGkgPSBmdW5jcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBhcmdzID0gW2Z1bmNzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhcmdzWzBdO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIGFmdGVyIGJlaW5nIGNhbGxlZCBOIHRpbWVzLlxuICBfLmFmdGVyID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICBpZiAodGltZXMgPD0gMCkgcmV0dXJuIGZ1bmMoKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA8IDEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIE9iamVjdCBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJldHJpZXZlIHRoZSBuYW1lcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgT2JqZWN0LmtleXNgXG4gIF8ua2V5cyA9IG5hdGl2ZUtleXMgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiAhPT0gT2JqZWN0KG9iaikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgb2JqZWN0Jyk7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSBrZXlzW2tleXMubGVuZ3RoXSA9IGtleTtcbiAgICByZXR1cm4ga2V5cztcbiAgfTtcblxuICAvLyBSZXRyaWV2ZSB0aGUgdmFsdWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIF8udmFsdWVzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIHZhbHVlcy5wdXNoKG9ialtrZXldKTtcbiAgICByZXR1cm4gdmFsdWVzO1xuICB9O1xuXG4gIC8vIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYSBsaXN0IG9mIGBba2V5LCB2YWx1ZV1gIHBhaXJzLlxuICBfLnBhaXJzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHBhaXJzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkgcGFpcnMucHVzaChba2V5LCBvYmpba2V5XV0pO1xuICAgIHJldHVybiBwYWlycztcbiAgfTtcblxuICAvLyBJbnZlcnQgdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhbiBvYmplY3QuIFRoZSB2YWx1ZXMgbXVzdCBiZSBzZXJpYWxpemFibGUuXG4gIF8uaW52ZXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIHJlc3VsdFtvYmpba2V5XV0gPSBrZXk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBzb3J0ZWQgbGlzdCBvZiB0aGUgZnVuY3Rpb24gbmFtZXMgYXZhaWxhYmxlIG9uIHRoZSBvYmplY3QuXG4gIC8vIEFsaWFzZWQgYXMgYG1ldGhvZHNgXG4gIF8uZnVuY3Rpb25zID0gXy5tZXRob2RzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIG5hbWVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihvYmpba2V5XSkpIG5hbWVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzLnNvcnQoKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIHByb3BlcnRpZXMgaW4gcGFzc2VkLWluIG9iamVjdChzKS5cbiAgXy5leHRlbmQgPSBmdW5jdGlvbihvYmopIHtcbiAgICBlYWNoKHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSwgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgb25seSBjb250YWluaW5nIHRoZSB3aGl0ZWxpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLnBpY2sgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIHZhciBrZXlzID0gY29uY2F0LmFwcGx5KEFycmF5UHJvdG8sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgZWFjaChrZXlzLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgIGlmIChrZXkgaW4gb2JqKSBjb3B5W2tleV0gPSBvYmpba2V5XTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29weTtcbiAgfTtcblxuICAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IHdpdGhvdXQgdGhlIGJsYWNrbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ub21pdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBjb3B5ID0ge307XG4gICAgdmFyIGtleXMgPSBjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoIV8uY29udGFpbnMoa2V5cywga2V5KSkgY29weVtrZXldID0gb2JqW2tleV07XG4gICAgfVxuICAgIHJldHVybiBjb3B5O1xuICB9O1xuXG4gIC8vIEZpbGwgaW4gYSBnaXZlbiBvYmplY3Qgd2l0aCBkZWZhdWx0IHByb3BlcnRpZXMuXG4gIF8uZGVmYXVsdHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBlYWNoKHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSwgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgaWYgKG9ialtwcm9wXSA9PSBudWxsKSBvYmpbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIChzaGFsbG93LWNsb25lZCkgZHVwbGljYXRlIG9mIGFuIG9iamVjdC5cbiAgXy5jbG9uZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICAgIHJldHVybiBfLmlzQXJyYXkob2JqKSA/IG9iai5zbGljZSgpIDogXy5leHRlbmQoe30sIG9iaik7XG4gIH07XG5cbiAgLy8gSW52b2tlcyBpbnRlcmNlcHRvciB3aXRoIHRoZSBvYmosIGFuZCB0aGVuIHJldHVybnMgb2JqLlxuICAvLyBUaGUgcHJpbWFyeSBwdXJwb3NlIG9mIHRoaXMgbWV0aG9kIGlzIHRvIFwidGFwIGludG9cIiBhIG1ldGhvZCBjaGFpbiwgaW5cbiAgLy8gb3JkZXIgdG8gcGVyZm9ybSBvcGVyYXRpb25zIG9uIGludGVybWVkaWF0ZSByZXN1bHRzIHdpdGhpbiB0aGUgY2hhaW4uXG4gIF8udGFwID0gZnVuY3Rpb24ob2JqLCBpbnRlcmNlcHRvcikge1xuICAgIGludGVyY2VwdG9yKG9iaik7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICB2YXIgZXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIElkZW50aWNhbCBvYmplY3RzIGFyZSBlcXVhbC4gYDAgPT09IC0wYCwgYnV0IHRoZXkgYXJlbid0IGlkZW50aWNhbC5cbiAgICAvLyBTZWUgdGhlIEhhcm1vbnkgYGVnYWxgIHByb3Bvc2FsOiBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255OmVnYWwuXG4gICAgaWYgKGEgPT09IGIpIHJldHVybiBhICE9PSAwIHx8IDEgLyBhID09IDEgLyBiO1xuICAgIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGEgPT09IGI7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPSB0b1N0cmluZy5jYWxsKGIpKSByZXR1cm4gZmFsc2U7XG4gICAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICAgIC8vIFN0cmluZ3MsIG51bWJlcnMsIGRhdGVzLCBhbmQgYm9vbGVhbnMgYXJlIGNvbXBhcmVkIGJ5IHZhbHVlLlxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gYSA9PSBTdHJpbmcoYik7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLiBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yXG4gICAgICAgIC8vIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgICByZXR1cm4gYSAhPSArYSA/IGIgIT0gK2IgOiAoYSA9PSAwID8gMSAvIGEgPT0gMSAvIGIgOiBhID09ICtiKTtcbiAgICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOlxuICAgICAgY2FzZSAnW29iamVjdCBCb29sZWFuXSc6XG4gICAgICAgIC8vIENvZXJjZSBkYXRlcyBhbmQgYm9vbGVhbnMgdG8gbnVtZXJpYyBwcmltaXRpdmUgdmFsdWVzLiBEYXRlcyBhcmUgY29tcGFyZWQgYnkgdGhlaXJcbiAgICAgICAgLy8gbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zLiBOb3RlIHRoYXQgaW52YWxpZCBkYXRlcyB3aXRoIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9uc1xuICAgICAgICAvLyBvZiBgTmFOYCBhcmUgbm90IGVxdWl2YWxlbnQuXG4gICAgICAgIHJldHVybiArYSA9PSArYjtcbiAgICAgIC8vIFJlZ0V4cHMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyIHNvdXJjZSBwYXR0ZXJucyBhbmQgZmxhZ3MuXG4gICAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgICByZXR1cm4gYS5zb3VyY2UgPT0gYi5zb3VyY2UgJiZcbiAgICAgICAgICAgICAgIGEuZ2xvYmFsID09IGIuZ2xvYmFsICYmXG4gICAgICAgICAgICAgICBhLm11bHRpbGluZSA9PSBiLm11bHRpbGluZSAmJlxuICAgICAgICAgICAgICAgYS5pZ25vcmVDYXNlID09IGIuaWdub3JlQ2FzZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhICE9ICdvYmplY3QnIHx8IHR5cGVvZiBiICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gQXNzdW1lIGVxdWFsaXR5IGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpY1xuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxuICAgIHZhciBsZW5ndGggPSBhU3RhY2subGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT0gYSkgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09IGI7XG4gICAgfVxuICAgIC8vIEFkZCB0aGUgZmlyc3Qgb2JqZWN0IHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucHVzaChhKTtcbiAgICBiU3RhY2sucHVzaChiKTtcbiAgICB2YXIgc2l6ZSA9IDAsIHJlc3VsdCA9IHRydWU7XG4gICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgaWYgKGNsYXNzTmFtZSA9PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cbiAgICAgIHNpemUgPSBhLmxlbmd0aDtcbiAgICAgIHJlc3VsdCA9IHNpemUgPT0gYi5sZW5ndGg7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIC8vIERlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXMuXG4gICAgICAgIHdoaWxlIChzaXplLS0pIHtcbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSBlcShhW3NpemVdLCBiW3NpemVdLCBhU3RhY2ssIGJTdGFjaykpKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBPYmplY3RzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWl2YWxlbnQsIGJ1dCBgT2JqZWN0YHNcbiAgICAgIC8vIGZyb20gZGlmZmVyZW50IGZyYW1lcyBhcmUuXG4gICAgICB2YXIgYUN0b3IgPSBhLmNvbnN0cnVjdG9yLCBiQ3RvciA9IGIuY29uc3RydWN0b3I7XG4gICAgICBpZiAoYUN0b3IgIT09IGJDdG9yICYmICEoXy5pc0Z1bmN0aW9uKGFDdG9yKSAmJiAoYUN0b3IgaW5zdGFuY2VvZiBhQ3RvcikgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmlzRnVuY3Rpb24oYkN0b3IpICYmIChiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gRGVlcCBjb21wYXJlIG9iamVjdHMuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gYSkge1xuICAgICAgICBpZiAoXy5oYXMoYSwga2V5KSkge1xuICAgICAgICAgIC8vIENvdW50IHRoZSBleHBlY3RlZCBudW1iZXIgb2YgcHJvcGVydGllcy5cbiAgICAgICAgICBzaXplKys7XG4gICAgICAgICAgLy8gRGVlcCBjb21wYXJlIGVhY2ggbWVtYmVyLlxuICAgICAgICAgIGlmICghKHJlc3VsdCA9IF8uaGFzKGIsIGtleSkgJiYgZXEoYVtrZXldLCBiW2tleV0sIGFTdGFjaywgYlN0YWNrKSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBFbnN1cmUgdGhhdCBib3RoIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllcy5cbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgZm9yIChrZXkgaW4gYikge1xuICAgICAgICAgIGlmIChfLmhhcyhiLCBrZXkpICYmICEoc2l6ZS0tKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gIXNpemU7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFJlbW92ZSB0aGUgZmlyc3Qgb2JqZWN0IGZyb20gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wb3AoKTtcbiAgICBiU3RhY2sucG9wKCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbiAgXy5pc0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBlcShhLCBiLCBbXSwgW10pO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gYXJyYXksIHN0cmluZywgb3Igb2JqZWN0IGVtcHR5P1xuICAvLyBBbiBcImVtcHR5XCIgb2JqZWN0IGhhcyBubyBlbnVtZXJhYmxlIG93bi1wcm9wZXJ0aWVzLlxuICBfLmlzRW1wdHkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiB0cnVlO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSB8fCBfLmlzU3RyaW5nKG9iaikpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgRE9NIGVsZW1lbnQ/XG4gIF8uaXNFbGVtZW50ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuICEhKG9iaiAmJiBvYmoubm9kZVR5cGUgPT09IDEpO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYW4gYXJyYXk/XG4gIC8vIERlbGVnYXRlcyB0byBFQ01BNSdzIG5hdGl2ZSBBcnJheS5pc0FycmF5XG4gIF8uaXNBcnJheSA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgYW4gb2JqZWN0P1xuICBfLmlzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG4gIH07XG5cbiAgLy8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAuXG4gIGVhY2goWydBcmd1bWVudHMnLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgX1snaXMnICsgbmFtZV0gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRGVmaW5lIGEgZmFsbGJhY2sgdmVyc2lvbiBvZiB0aGUgbWV0aG9kIGluIGJyb3dzZXJzIChhaGVtLCBJRSksIHdoZXJlXG4gIC8vIHRoZXJlIGlzbid0IGFueSBpbnNwZWN0YWJsZSBcIkFyZ3VtZW50c1wiIHR5cGUuXG4gIGlmICghXy5pc0FyZ3VtZW50cyhhcmd1bWVudHMpKSB7XG4gICAgXy5pc0FyZ3VtZW50cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICEhKG9iaiAmJiBfLmhhcyhvYmosICdjYWxsZWUnKSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE9wdGltaXplIGBpc0Z1bmN0aW9uYCBpZiBhcHByb3ByaWF0ZS5cbiAgaWYgKHR5cGVvZiAoLy4vKSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIF8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbic7XG4gICAgfTtcbiAgfVxuXG4gIC8vIElzIGEgZ2l2ZW4gb2JqZWN0IGEgZmluaXRlIG51bWJlcj9cbiAgXy5pc0Zpbml0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBpc0Zpbml0ZShvYmopICYmICFpc05hTihwYXJzZUZsb2F0KG9iaikpO1xuICB9O1xuXG4gIC8vIElzIHRoZSBnaXZlbiB2YWx1ZSBgTmFOYD8gKE5hTiBpcyB0aGUgb25seSBudW1iZXIgd2hpY2ggZG9lcyBub3QgZXF1YWwgaXRzZWxmKS5cbiAgXy5pc05hTiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfLmlzTnVtYmVyKG9iaikgJiYgb2JqICE9ICtvYmo7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIGJvb2xlYW4/XG4gIF8uaXNCb29sZWFuID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBCb29sZWFuXSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBlcXVhbCB0byBudWxsP1xuICBfLmlzTnVsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IG51bGw7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSB1bmRlZmluZWQ/XG4gIF8uaXNVbmRlZmluZWQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB2b2lkIDA7XG4gIH07XG5cbiAgLy8gU2hvcnRjdXQgZnVuY3Rpb24gZm9yIGNoZWNraW5nIGlmIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBwcm9wZXJ0eSBkaXJlY3RseVxuICAvLyBvbiBpdHNlbGYgKGluIG90aGVyIHdvcmRzLCBub3Qgb24gYSBwcm90b3R5cGUpLlxuICBfLmhhcyA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpO1xuICB9O1xuXG4gIC8vIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUnVuIFVuZGVyc2NvcmUuanMgaW4gKm5vQ29uZmxpY3QqIG1vZGUsIHJldHVybmluZyB0aGUgYF9gIHZhcmlhYmxlIHRvIGl0c1xuICAvLyBwcmV2aW91cyBvd25lci4gUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJvb3QuXyA9IHByZXZpb3VzVW5kZXJzY29yZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBLZWVwIHRoZSBpZGVudGl0eSBmdW5jdGlvbiBhcm91bmQgZm9yIGRlZmF1bHQgaXRlcmF0b3JzLlxuICBfLmlkZW50aXR5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KG4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgaSk7XG4gICAgcmV0dXJuIGFjY3VtO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHJhbmRvbSBpbnRlZ2VyIGJldHdlZW4gbWluIGFuZCBtYXggKGluY2x1c2l2ZSkuXG4gIF8ucmFuZG9tID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICBpZiAobWF4ID09IG51bGwpIHtcbiAgICAgIG1heCA9IG1pbjtcbiAgICAgIG1pbiA9IDA7XG4gICAgfVxuICAgIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpO1xuICB9O1xuXG4gIC8vIExpc3Qgb2YgSFRNTCBlbnRpdGllcyBmb3IgZXNjYXBpbmcuXG4gIHZhciBlbnRpdHlNYXAgPSB7XG4gICAgZXNjYXBlOiB7XG4gICAgICAnJic6ICcmYW1wOycsXG4gICAgICAnPCc6ICcmbHQ7JyxcbiAgICAgICc+JzogJyZndDsnLFxuICAgICAgJ1wiJzogJyZxdW90OycsXG4gICAgICBcIidcIjogJyYjeDI3OycsXG4gICAgICAnLyc6ICcmI3gyRjsnXG4gICAgfVxuICB9O1xuICBlbnRpdHlNYXAudW5lc2NhcGUgPSBfLmludmVydChlbnRpdHlNYXAuZXNjYXBlKTtcblxuICAvLyBSZWdleGVzIGNvbnRhaW5pbmcgdGhlIGtleXMgYW5kIHZhbHVlcyBsaXN0ZWQgaW1tZWRpYXRlbHkgYWJvdmUuXG4gIHZhciBlbnRpdHlSZWdleGVzID0ge1xuICAgIGVzY2FwZTogICBuZXcgUmVnRXhwKCdbJyArIF8ua2V5cyhlbnRpdHlNYXAuZXNjYXBlKS5qb2luKCcnKSArICddJywgJ2cnKSxcbiAgICB1bmVzY2FwZTogbmV3IFJlZ0V4cCgnKCcgKyBfLmtleXMoZW50aXR5TWFwLnVuZXNjYXBlKS5qb2luKCd8JykgKyAnKScsICdnJylcbiAgfTtcblxuICAvLyBGdW5jdGlvbnMgZm9yIGVzY2FwaW5nIGFuZCB1bmVzY2FwaW5nIHN0cmluZ3MgdG8vZnJvbSBIVE1MIGludGVycG9sYXRpb24uXG4gIF8uZWFjaChbJ2VzY2FwZScsICd1bmVzY2FwZSddLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICBfW21ldGhvZF0gPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIGlmIChzdHJpbmcgPT0gbnVsbCkgcmV0dXJuICcnO1xuICAgICAgcmV0dXJuICgnJyArIHN0cmluZykucmVwbGFjZShlbnRpdHlSZWdleGVzW21ldGhvZF0sIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICAgIHJldHVybiBlbnRpdHlNYXBbbWV0aG9kXVttYXRjaF07XG4gICAgICB9KTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBJZiB0aGUgdmFsdWUgb2YgdGhlIG5hbWVkIHByb3BlcnR5IGlzIGEgZnVuY3Rpb24gdGhlbiBpbnZva2UgaXQ7XG4gIC8vIG90aGVyd2lzZSwgcmV0dXJuIGl0LlxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHJldHVybiBudWxsO1xuICAgIHZhciB2YWx1ZSA9IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgcmV0dXJuIF8uaXNGdW5jdGlvbih2YWx1ZSkgPyB2YWx1ZS5jYWxsKG9iamVjdCkgOiB2YWx1ZTtcbiAgfTtcblxuICAvLyBBZGQgeW91ciBvd24gY3VzdG9tIGZ1bmN0aW9ucyB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubWl4aW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICBlYWNoKF8uZnVuY3Rpb25zKG9iaiksIGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgdmFyIGZ1bmMgPSBfW25hbWVdID0gb2JqW25hbWVdO1xuICAgICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbdGhpcy5fd3JhcHBlZF07XG4gICAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIGZ1bmMuYXBwbHkoXywgYXJncykpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhIHVuaXF1ZSBpbnRlZ2VyIGlkICh1bmlxdWUgd2l0aGluIHRoZSBlbnRpcmUgY2xpZW50IHNlc3Npb24pLlxuICAvLyBVc2VmdWwgZm9yIHRlbXBvcmFyeSBET00gaWRzLlxuICB2YXIgaWRDb3VudGVyID0gMDtcbiAgXy51bmlxdWVJZCA9IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgIHZhciBpZCA9ICsraWRDb3VudGVyICsgJyc7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG4gIH07XG5cbiAgLy8gQnkgZGVmYXVsdCwgVW5kZXJzY29yZSB1c2VzIEVSQi1zdHlsZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLCBjaGFuZ2UgdGhlXG4gIC8vIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cbiAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgIGV2YWx1YXRlICAgIDogLzwlKFtcXHNcXFNdKz8pJT4vZyxcbiAgICBpbnRlcnBvbGF0ZSA6IC88JT0oW1xcc1xcU10rPyklPi9nLFxuICAgIGVzY2FwZSAgICAgIDogLzwlLShbXFxzXFxTXSs/KSU+L2dcbiAgfTtcblxuICAvLyBXaGVuIGN1c3RvbWl6aW5nIGB0ZW1wbGF0ZVNldHRpbmdzYCwgaWYgeW91IGRvbid0IHdhbnQgdG8gZGVmaW5lIGFuXG4gIC8vIGludGVycG9sYXRpb24sIGV2YWx1YXRpb24gb3IgZXNjYXBpbmcgcmVnZXgsIHdlIG5lZWQgb25lIHRoYXQgaXNcbiAgLy8gZ3VhcmFudGVlZCBub3QgdG8gbWF0Y2guXG4gIHZhciBub01hdGNoID0gLyguKV4vO1xuXG4gIC8vIENlcnRhaW4gY2hhcmFjdGVycyBuZWVkIHRvIGJlIGVzY2FwZWQgc28gdGhhdCB0aGV5IGNhbiBiZSBwdXQgaW50byBhXG4gIC8vIHN0cmluZyBsaXRlcmFsLlxuICB2YXIgZXNjYXBlcyA9IHtcbiAgICBcIidcIjogICAgICBcIidcIixcbiAgICAnXFxcXCc6ICAgICAnXFxcXCcsXG4gICAgJ1xccic6ICAgICAncicsXG4gICAgJ1xcbic6ICAgICAnbicsXG4gICAgJ1xcdCc6ICAgICAndCcsXG4gICAgJ1xcdTIwMjgnOiAndTIwMjgnLFxuICAgICdcXHUyMDI5JzogJ3UyMDI5J1xuICB9O1xuXG4gIHZhciBlc2NhcGVyID0gL1xcXFx8J3xcXHJ8XFxufFxcdHxcXHUyMDI4fFxcdTIwMjkvZztcblxuICAvLyBKYXZhU2NyaXB0IG1pY3JvLXRlbXBsYXRpbmcsIHNpbWlsYXIgdG8gSm9obiBSZXNpZydzIGltcGxlbWVudGF0aW9uLlxuICAvLyBVbmRlcnNjb3JlIHRlbXBsYXRpbmcgaGFuZGxlcyBhcmJpdHJhcnkgZGVsaW1pdGVycywgcHJlc2VydmVzIHdoaXRlc3BhY2UsXG4gIC8vIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxuICBfLnRlbXBsYXRlID0gZnVuY3Rpb24odGV4dCwgZGF0YSwgc2V0dGluZ3MpIHtcbiAgICB2YXIgcmVuZGVyO1xuICAgIHNldHRpbmdzID0gXy5kZWZhdWx0cyh7fSwgc2V0dGluZ3MsIF8udGVtcGxhdGVTZXR0aW5ncyk7XG5cbiAgICAvLyBDb21iaW5lIGRlbGltaXRlcnMgaW50byBvbmUgcmVndWxhciBleHByZXNzaW9uIHZpYSBhbHRlcm5hdGlvbi5cbiAgICB2YXIgbWF0Y2hlciA9IG5ldyBSZWdFeHAoW1xuICAgICAgKHNldHRpbmdzLmVzY2FwZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuaW50ZXJwb2xhdGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmV2YWx1YXRlIHx8IG5vTWF0Y2gpLnNvdXJjZVxuICAgIF0uam9pbignfCcpICsgJ3wkJywgJ2cnKTtcblxuICAgIC8vIENvbXBpbGUgdGhlIHRlbXBsYXRlIHNvdXJjZSwgZXNjYXBpbmcgc3RyaW5nIGxpdGVyYWxzIGFwcHJvcHJpYXRlbHkuXG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc291cmNlID0gXCJfX3ArPSdcIjtcbiAgICB0ZXh0LnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24obWF0Y2gsIGVzY2FwZSwgaW50ZXJwb2xhdGUsIGV2YWx1YXRlLCBvZmZzZXQpIHtcbiAgICAgIHNvdXJjZSArPSB0ZXh0LnNsaWNlKGluZGV4LCBvZmZzZXQpXG4gICAgICAgIC5yZXBsYWNlKGVzY2FwZXIsIGZ1bmN0aW9uKG1hdGNoKSB7IHJldHVybiAnXFxcXCcgKyBlc2NhcGVzW21hdGNoXTsgfSk7XG5cbiAgICAgIGlmIChlc2NhcGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBlc2NhcGUgKyBcIikpPT1udWxsPycnOl8uZXNjYXBlKF9fdCkpK1xcbidcIjtcbiAgICAgIH1cbiAgICAgIGlmIChpbnRlcnBvbGF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGludGVycG9sYXRlICsgXCIpKT09bnVsbD8nJzpfX3QpK1xcbidcIjtcbiAgICAgIH1cbiAgICAgIGlmIChldmFsdWF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGUgKyBcIlxcbl9fcCs9J1wiO1xuICAgICAgfVxuICAgICAgaW5kZXggPSBvZmZzZXQgKyBtYXRjaC5sZW5ndGg7XG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG4gICAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAgIC8vIElmIGEgdmFyaWFibGUgaXMgbm90IHNwZWNpZmllZCwgcGxhY2UgZGF0YSB2YWx1ZXMgaW4gbG9jYWwgc2NvcGUuXG4gICAgaWYgKCFzZXR0aW5ncy52YXJpYWJsZSkgc291cmNlID0gJ3dpdGgob2JqfHx7fSl7XFxuJyArIHNvdXJjZSArICd9XFxuJztcblxuICAgIHNvdXJjZSA9IFwidmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLFwiICtcbiAgICAgIFwicHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcXG5cIiArXG4gICAgICBzb3VyY2UgKyBcInJldHVybiBfX3A7XFxuXCI7XG5cbiAgICB0cnkge1xuICAgICAgcmVuZGVyID0gbmV3IEZ1bmN0aW9uKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonLCAnXycsIHNvdXJjZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZS5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGlmIChkYXRhKSByZXR1cm4gcmVuZGVyKGRhdGEsIF8pO1xuICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiByZW5kZXIuY2FsbCh0aGlzLCBkYXRhLCBfKTtcbiAgICB9O1xuXG4gICAgLy8gUHJvdmlkZSB0aGUgY29tcGlsZWQgZnVuY3Rpb24gc291cmNlIGFzIGEgY29udmVuaWVuY2UgZm9yIHByZWNvbXBpbGF0aW9uLlxuICAgIHRlbXBsYXRlLnNvdXJjZSA9ICdmdW5jdGlvbignICsgKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonKSArICcpe1xcbicgKyBzb3VyY2UgKyAnfSc7XG5cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH07XG5cbiAgLy8gQWRkIGEgXCJjaGFpblwiIGZ1bmN0aW9uLCB3aGljaCB3aWxsIGRlbGVnYXRlIHRvIHRoZSB3cmFwcGVyLlxuICBfLmNoYWluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8ob2JqKS5jaGFpbigpO1xuICB9O1xuXG4gIC8vIE9PUFxuICAvLyAtLS0tLS0tLS0tLS0tLS1cbiAgLy8gSWYgVW5kZXJzY29yZSBpcyBjYWxsZWQgYXMgYSBmdW5jdGlvbiwgaXQgcmV0dXJucyBhIHdyYXBwZWQgb2JqZWN0IHRoYXRcbiAgLy8gY2FuIGJlIHVzZWQgT08tc3R5bGUuIFRoaXMgd3JhcHBlciBob2xkcyBhbHRlcmVkIHZlcnNpb25zIG9mIGFsbCB0aGVcbiAgLy8gdW5kZXJzY29yZSBmdW5jdGlvbnMuIFdyYXBwZWQgb2JqZWN0cyBtYXkgYmUgY2hhaW5lZC5cblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29udGludWUgY2hhaW5pbmcgaW50ZXJtZWRpYXRlIHJlc3VsdHMuXG4gIHZhciByZXN1bHQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fY2hhaW4gPyBfKG9iaikuY2hhaW4oKSA6IG9iajtcbiAgfTtcblxuICAvLyBBZGQgYWxsIG9mIHRoZSBVbmRlcnNjb3JlIGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlciBvYmplY3QuXG4gIF8ubWl4aW4oXyk7XG5cbiAgLy8gQWRkIGFsbCBtdXRhdG9yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgZWFjaChbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzcGxpY2UnLCAndW5zaGlmdCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvYmogPSB0aGlzLl93cmFwcGVkO1xuICAgICAgbWV0aG9kLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICAgIGlmICgobmFtZSA9PSAnc2hpZnQnIHx8IG5hbWUgPT0gJ3NwbGljZScpICYmIG9iai5sZW5ndGggPT09IDApIGRlbGV0ZSBvYmpbMF07XG4gICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgb2JqKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBBZGQgYWxsIGFjY2Vzc29yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgZWFjaChbJ2NvbmNhdCcsICdqb2luJywgJ3NsaWNlJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG1ldGhvZC5hcHBseSh0aGlzLl93cmFwcGVkLCBhcmd1bWVudHMpKTtcbiAgICB9O1xuICB9KTtcblxuICBfLmV4dGVuZChfLnByb3RvdHlwZSwge1xuXG4gICAgLy8gU3RhcnQgY2hhaW5pbmcgYSB3cmFwcGVkIFVuZGVyc2NvcmUgb2JqZWN0LlxuICAgIGNoYWluOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2NoYWluID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBFeHRyYWN0cyB0aGUgcmVzdWx0IGZyb20gYSB3cmFwcGVkIGFuZCBjaGFpbmVkIG9iamVjdC5cbiAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fd3JhcHBlZDtcbiAgICB9XG5cbiAgfSk7XG5cbn0pLmNhbGwodGhpcyk7XG4iXX0=
;