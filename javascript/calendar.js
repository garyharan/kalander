/*
Copyright (c) 2002-2006 Gary Haran (http://www.garyharan.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
// This library uses and extends the script.aculo.us library
// For details, see the script.aculo.us web site: http://script.aculo.us/

if(typeof Effect == 'undefined')
  throw("calendar.js requires including script.aculo.us' effects.js library");

Object.extend (Date.prototype, {
	i18nMonthNames: [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December" 
  ],
  i18nDayNames: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  i18nShortDayNames: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], 
  i18nPreviousMonth: "Previous month",
  i18nNextMonth: "Next month",
  i18nToday: "Today",
  i18nClose: "Close",

  isLeap: function(){
    return 1 == new Date(this.getFullYear(),1,29).getMonth();
  },

  isSameDateAs: function(date){
    return (this.getFullYear()  == date.getFullYear() 
         && this.getMonth()     == date.getMonth()
         && this.getDate()      == date.getDate () )
  },
  
	stripDate: function(){
		this.setHours(0);
		this.setMinutes(0);
		this.setSeconds(0);
		this.setMilliseconds(0);
		return this;
	},

  isWeekEnd: function(){
    return this.getDay() == 0 || this.getDay() == 6;
  },
  
  getDaysInMonth: function(){
    return [31,(this.isLeap()?29:28),31,30,31,30,31,31,30,31,30,31][this.getMonth()]
  },
  
  getMySqlDate: function(){
    return [this.getFullYear(),
           (this.getMonth() <= 8 ? '0'+(this.getMonth()+1)	: this.getMonth()+1), 
           (this.getDate()	< 10 ? '0'+this.getDate()				: this.getDate())
    ].join('-')
  },

  parseMySqlDate: function(str){
    var tokens = str.split('-');
    if (tokens.length == 3){
      this.setYear(tokens[0]);
      this.setMonth(Number(tokens[1]) - 1);
      this.setDate(tokens[2]);
    }	else if ($(str).value && $(str).value.split('-').length == 3){
				return this.parseMySqlDate( $(str).value );
		}else if ($(str).value && $(str).innerHTML.split('-').length == 3){
			return this.parseMySqlDate( $(str).innerHTML );
		}
    return this
  },
  
	backOneMonth: function(){
		if (this.getMonth() == 0){
			this.setYear(this.getFullYear() - 1);
			this.setMonth(11);
		}else{
			this.setMonth(this.getMonth()-1)
		}
		return this;
	},
	
  getMonthStartDay: function(){
    var date = this; 
    date.setDate(1);
    return date.getDay();
  },

  getYearStartDay: function(){ 
    var date = this;
    date.setDate(1);
    date.setMonth(0);
    return date.getMonthStartDay ();
  },

  onClick: function(event, date){
    this.setDate(date.getDate());
    this.setMonth(date.getMonth());
    this.setYear(date.getFullYear());
    if (this.element.innerHTML){
			this.element.innerHTML = date.getMySqlDate();
		} else {
			this.element.value = date.getMySqlDate();
		}
      
    if (typeof this.options.onComplete == 'function')
      this.options.onComplete(this.element, this.options);

		this.close();
  },

  onClickDisabled: function(event){
		Effect.Shake(this.container, {duration:0.15})
  },

  onClickArrows: function(event, date){
    this.setDate(date.getDate());
    this.setMonth(date.getMonth());
    this.setYear(date.getFullYear());
    this.getMonthHTML();
  },
    
  close: function(event){
  	Effect.SlideUp(this.container, {duration:0.15});
  },
    
	open: function(event){
		if(!this.container.style.position || this.container.style.position=='absolute') {
     	this.container.style.position = 'absolute';
     	Position.clone(this.element, this.container, {setHeight: false,offsetTop: this.element.offsetHeight});
		}
		Effect.Appear(this.container,{duration: 0.15});
  },
    
  getMonthHTML: function(){
		var table = document.createElement('table');
		table.className = 'calendar_table';
		
		var thead = document.createElement('thead');
		thead.className = 'calendar_table_thead';
		var tr		= document.createElement('tr');
		var th		= document.createElement('th');
		th.colSpan = '7';
		
		var headerTable = document.createElement('table');
		headerTable.style.width = '100%';
		var headerThead = document.createElement('thead');
		var headerTr		= document.createElement('tr');
		
		// previous, today and next month controls
		var headerCol1	= document.createElement('th');
		headerCol1.style.textAlign = 'left'
		headerCol1.className = 'calendar_table_header_th';
		// previous month
		var prevLink		= document.createElement('a');
		prevLink.setAttribute('href', 'javascript:void(null)');
		prevLink.setAttribute('title', this.i18nPreviousMonth);
    prevLink.appendChild(document.createTextNode('\u2190')) // larr
		prevLink.className = 'calendar_table_header_navLink';
		Event.observe(prevLink, "click",
			this.onClickArrows.bindAsEventListener(
				this, 
				new Date(this.getFullYear(), this.getMonth(), this.getDate()).backOneMonth()
			)
		);
		headerCol1.appendChild(prevLink);
		// today
		var todayLink 	= document.createElement('a');
		todayLink.setAttribute('href', 'javascript:void(null)');
		todayLink.setAttribute('title', this.i18nToday);
		todayLink.appendChild(document.createTextNode('today'));
		todayLink.className = 'calendar_table_header_navLink';
		Event.observe(todayLink, "click",
			this.onClickArrows.bindAsEventListener(this,new Date())
		);
		headerCol1.appendChild(todayLink);
		// next month
		var nextLink = document.createElement('a');
		nextLink.setAttribute('href', 'javascript:void(null)');
		nextLink.setAttribute('title', this.i18nNextMonth);
		nextLink.appendChild(document.createTextNode('\u2192')) // rarr
		nextLink.className = 'calendar_table_header_navLink';
		Event.observe(nextLink, "click",
			this.onClickArrows.bindAsEventListener(this, 
				new Date(this.getFullYear(), this.getMonth()+1, this.getDate())
			)
		);
		headerCol1.appendChild(nextLink);
		headerTr.appendChild(headerCol1);
		// this will hold the month and year
		var headerCol2	= document.createElement('th');
		headerCol2.className = 'calendar_table_header_th';
		headerCol2.appendChild(document.createTextNode(this.i18nMonthNames[this.getMonth()]));
		headerCol2.appendChild(document.createTextNode('\u00a0' + this.getFullYear()));
		// close link 
		var headerCol3	= document.createElement('th');
		headerCol3.className = 'calendar_table_header_th';
		var closeLink = document.createElement('a');
		closeLink.setAttribute('href', 'javascript:void(null)');
		closeLink.setAttribute('title', this.i18nClose);
		closeLink.appendChild(document.createTextNode( (document.all ? '\u2191' : '\u2297') ))
		closeLink.className = 'calendar_table_header_navLink';
		Event.observe(closeLink, "click",	this.close.bindAsEventListener(this) );
		headerCol3.appendChild(closeLink);
		
		headerTr.appendChild(headerCol1);
		headerTr.appendChild(headerCol2);
		headerTr.appendChild(headerCol3);
		
		headerThead.appendChild(headerTr);
		headerTable.appendChild(headerThead);
		th.appendChild(headerTable);
		tr.appendChild(th);
		thead.appendChild(tr);
		
		// days of the week
		var daysTr = document.createElement('tr');
		for (var i = 0; i < 7; i++){
			var dayTh = document.createElement('th');
			dayTh.className = 'calendar_table_header_dayName';
			dayTh.appendChild(document.createTextNode(this.i18nShortDayNames[i]))
			dayTh.setAttribute('title', this.i18nDayNames[i]);
			daysTr.appendChild(dayTh);
		}
		thead.appendChild(daysTr);
		
		// days of the month
		var tbody = document.createElement('tbody');
		var cellDate = 0 - this.getMonthStartDay();
		var maxDate = this.getDaysInMonth();
		var maxDays = Math.ceil((this.getDaysInMonth() + this.getMonthStartDay()) / 7);
		for (var i = 0; i < maxDays; i++){
			var tr = document.createElement('tr');
			for (var j = 0; j < 7; j++){
				cellDate++;
				var cellDateObject = new Date(this.getFullYear(), this.getMonth(), cellDate);
				cellDateObject.stripDate();
				var td = document.createElement('td');
				td.style.width = '14%';
				
				if (cellDate >= 1 && cellDate <= maxDate){
					td.appendChild(document.createTextNode(cellDate));
					td.className = 'calendar_cell_curr_month';
				}else{
					td.appendChild(document.createTextNode(cellDateObject.getDate()));
					td.className = 'calendar_cell_not_curr_month';
				}
				
				if (	(this.options.weekends	== false && (cellDateObject.isWeekEnd()))
					||	(this.options.disabled	&& this.options.disabled.indexOf(cellDateObject.getMySqlDate()) > -1) 
					||  (this.options.before 		&& cellDateObject >= this.options.before.stripDate())
					||	(this.options.after			&& cellDateObject <= this.options.after.stripDate())
				) 
				{
					td.className += ' calendar_cell_disabled';
					Event.observe(td, "click", this.onClickDisabled.bindAsEventListener (this));
				} else {
					Event.observe(td, "click", this.onClick.bindAsEventListener (this,cellDateObject));
				}
				
				if ( cellDateObject.isSameDateAs(new Date()) ){
					td.className += ' calendar_cell_today';
				}
				
				tr.appendChild(td);
			}
			tbody.appendChild(tr);
		}
		
		table.appendChild(thead);
		table.appendChild(tbody);
		
		if (this.container.hasChildNodes()){
			this.container.replaceChild(table, this.container.firstChild)
		}else{
			this.container.appendChild(table);
		}
  },

  datePicker: function(element, options){
		this.stripDate();
  	this.element = $(element);
		if (!$(this.element.id + "_calendar_container")){
			var container = document.createElement('div');
			container.setAttribute('id',this.element.id + "_calendar_container");
			document.body.appendChild(container)
		}
		this.container = $(this.element.id + "_calendar_container");
    this.options = options || {}; 

    this.parseMySqlDate(this.element.id);
		
    if (typeof this.options.after == 'string'){
			this.options.after = new Date().parseMySqlDate(this.options.after);
			if (new Date() < this.options.after){
				this.setYear(this.options.after.getFullYear());
				this.setMonth(this.options.after.getMonth());
				this.setDate(this.options.after.getDate()+1);
			}
		} else this.options.after = false;
		
		if (typeof this.options.before == 'string'){
			this.options.before = new Date().parseMySqlDate(this.options.before)
			if (new Date() > this.options.before){
				this.setYear(this.options.before.getFullYear());
				this.setMonth(this.options.before.getMonth());
				this.setDate(this.options.before.getDate()-1);
			}
		} else this.options.before = false;
		
    this.getMonthHTML();
    this.open();
  }

});
