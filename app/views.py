__author__ = 'Victoria'

import sys
print sys.path

import json
import time
from app import app
from flask import render_template, request, jsonify
from qpylib import qpylib
import requests
from django.http import HttpResponse

#from django.http import HttpResponse, JsonResponse

@app.route('/')
@app.route('/index')
#def getIndex():

    #return render_template("map.html")
#def restData():
   # headers = {'content-type': 'application/json', 'Version': '5.1'}
  #  url = 'api/ariel/searches?query_expression=select * from flows'
   # return qpylib.REST('post', url, headers=headers).json()
#def restData():
 #try:
#	headers = {'content-type' : 'text/plain'}
#	arielOptions = qpylib.REST( 'post', 'api/ariel/searches?query_expression=select * from flows', headers = headers )
#	options = {}
#	qpylib.log(arielOptions.content)
#	for arielSearch in arielOptions.json():
#		options[arielSearch] = arielSearch.capitalize()
#		qpylib.log( "Search Post " + arielSearch )
#	return json.dumps({'id':'arielSearch', 'title':'search id', 'HTML':render_template("testAPICall.html",  options=options) } )
#except Exception as e:
#	qpylib.log( "Error "  + str(e), level='error' )
@app.route('/postArielSearch', methods=['POST'])
def restData():
	try:
		qpylib.log("hi")
		headers = {'content-type' : 'text/plain'}
		searchQuery = {'query_expression' : "select sourceip, destinationip from \"flows\" limit 5",}
		apiResponse = qpylib.REST( 'post', 'api/ariel/searches', headers=headers, params=searchQuery)
		qpylib.log(apiResponse.content)
		response = json.loads(apiResponse.content)
		search_id = (response['search_id'])
		qpylib.log('SEARCH ID :: %s' % response['search_id'])
		params = {}
		#	options = {}
		#	for arielSearch in apiResponse.json():
		#		options[arielSearch] = arielSearch.capitalize()
		#		qpylib.log( "Search value " + arielSearch)
		#	return json.dumps({'id':'arielSearch', 'title':'search id', 'HTML':render_template("testAPICall.html", options=options) } )
		return searchIDData(search_id)
		#return json.dumps({'id':'arielSearch', 'title':'search id'})
	except Exception as e:
		qpylib.log( "Error "  + str(e), level='error' )

def searchIDData(search_id):
	try:
		headers = {'content-type' : 'text/plain'}

		while True:
			statusResponse = qpylib.REST( 'get', 'api/ariel/searches/%s' % search_id, headers=headers)
			response = json.loads(statusResponse.content)
			qpylib.log('STATUS :: %s' % response['status'])
			qpylib.log('SEARCH_ID :: %s' % response['search_id'])
			status = response['status']
			statusSearch_id = response['search_id']

			if status == "COMPLETED":
				break
			else:
				time.sleep(3)
		return flowData(statusSearch_id)

	except Exception as e:
		qpylib.log( "Error "  + str(e), level='error' )
		#return render_template("map.html")

def flowData(statusSearch_id):
	try:
		headers = {'content-type' : 'text/plain'}
		#range = {"range":"items=0-5"}
		flowDataOptions = qpylib.REST( 'get', 'api/ariel/searches/%s' % statusSearch_id + '/results', headers=headers)

		#options = {}
		#group = {}
		#flow = flowDataOptions.json()
		#for flowInfo in flowDataOptions.json():
			#options[flowInfo] = flowInfo.capitalize()
			#qpylib.log( "Search value " + flowInfo)
		#flowInfo2 = json.loads(flowDataOptions.content)
		#flowData = {}
		flowData = flowDataOptions.json()
		qpylib.log(json.dumps(flowData))
		#qpylib.log(flowData)
		#flowDataJson = json.loads(flowData)
		#json = flowDataOptions.json()
		#qpylib.log(json)
		geoIpData = []
		geoIpDataDestination = []
		#for x in flowDataOptions.json():
		#	sourceIps['ipAddr'] = x['flows']['sourceip']
		#	qpylib.log( "result source ip " + x)
		qpylib.log('flowData flows:   ' + json.dumps(flowData['flows'],indent=2))

		for x in flowData['flows']:
			sourceIP = {}
			qpylib.log('inside flowdata loop')
			#sourceIP['ipAddr'] = flowData['flows']['sourceip']
			sourceIP['ipAddr'] = x['sourceip']
			#flowDataJson = json.loads(flowData)
			#qpylib.log(flowDataJson)
			#sourceIP[ipAddr] = flowDataJson['sourceip']
			qpylib.log('source ip:   ' + json.dumps(x['sourceip']))
			#qpylib.log('source ip ipadd  ' + json.dumps(sourceIP['ipAddr']))
			geoIpData.append(sourceIP)

		qpylib.log('geoIpData : ' + json.dumps(geoIpData, indent=2))

		for y in geoIpData:
			ipaddr = y['ipAddr']

			# write function where you request response from new freegeoip api
			# eg. locationData = return of getLocationData(ipaddr)
			#y['locationData'] = locationData
			locationData = getLocationData(ipaddr)
			qpylib.log('getLocationData result:   ' + json.dumps(locationData,indent=2))
			y['sourceLocationData'] = locationData

		qpylib.log('final geoIpData : ' + json.dumps(geoIpData, indent = 2))

		for a in flowData['flows']:
			destinationIP = {}
			destinationIP['ipAddrDest'] = a['destinationip']
			qpylib.log('destination ip:   ' + json.dumps(a['destinationip']))
			geoIpDataDestination.append(destinationIP)

		qpylib.log('geoIpDataDestination : ' + json.dumps(geoIpDataDestination, indent=2))

		for b in geoIpDataDestination:
			ipaddrdest = b['ipAddrDest']
			locationDataDest = getLocationDataDest(ipaddrdest)
			qpylib.log('getLocationDataDest result:   ' + json.dumps(locationDataDest,indent=2))
			b['destinationLocationData'] = locationDataDest

		qpylib.log('final geoIpDataDest : ' + json.dumps(geoIpDataDestination, indent = 2))

		return render_template("map.html", data=json.dumps(geoIpData), destinationData=json.dumps(geoIpDataDestination), base_url=qpylib.get_app_base_url())

	except Exception as e:
		qpylib.log( "Error ---- "  + str(e), level='error' )

def getLocationData(ipaddr):
	qpylib.log('entered in to getLocationData function')
	# get source ip location -- api url freegeoip.net/{format}/{ipaddr}
	# always use json for format and pass in ip
	# example of url : http://freegeoip.net/json/9.183.105.12 where 9.183.105.12 = ipaddr
	# locationData = {}
	#from response: locationData['longitude'] = response['longitude'],
	#               locationData['latitude'] = response['latitude']
	#return locationData
	try:
		qpylib.log('entered try of getLocationData')
		#headers = {'content-type' : 'text/plain'}
		locationAPI = requests.get('http://freegeoip.net/json/%s' % ipaddr)
		qpylib.log('successfully retrieved locationAPI response')
		sourceLocationData = {}
		result = locationAPI.json()
		qpylib.log(json.dumps(result, indent=2))
		sourceLocationData['longitude'] = result['longitude']
		sourceLocationData['latitude'] = result['latitude']
		qpylib.log('longitude :: %s' % result['longitude'])
		qpylib.log('latitude :: %s' % result['latitude'])

		qpylib.log(json.dumps(sourceLocationData, indent = 2))
		return sourceLocationData

		#for group[flows][0] in flowInfo2:
		#	qpylib.log('STATUS :: %s' % responseapi['sourceip'])
		#for flowInfo in flowDataOptions.json():
			#group = flowInfo.keys()
			#qpylib.log(group)
		#	group[flowInfo][i] = flowInfo.capitalize()
		#	qpylib.log( "FLOW DATA " + flowInfo + i)

			#for flowInfoInner in group[1]:
			#	options[flowInfoInner] = flowInfoInner.capitalize()
			#	qpylib.log( "FLOW DATA " + flowInfoInner )
		#return json.dumps({'id':'ArielDBs', 'title':'Choose a DB', 'HTML':render_template("map.html",  options=options)})
		#return render_template("map.html")
		#return 'getLocationData success'

	except Exception as e:
		qpylib.log( "Error ///  "  + str(e), level='error' )
		return 'getLocationData failed'

def getLocationDataDest(ipaddrdest):
	#qpylib.log('entered in to getLocationDataDest function')
	# get source ip location -- api url freegeoip.net/{format}/{ipaddr}
	# always use json for format and pass in ip
	# example of url : http://freegeoip.net/json/9.183.105.12 where 9.183.105.12 = ipaddr
	# locationData = {}
	#from response: locationData['longitude'] = response['longitude'],
	#               locationData['latitude'] = response['latitude']
	#return locationData
	try:
	#	qpylib.log('entered try of getLocationData destination')
		#headers = {'content-type' : 'text/plain'}
		destinationLocationAPI = requests.get('http://freegeoip.net/json/%s' % ipaddrdest)
	#	qpylib.log('successfully retrieved locationAPI response')
		destinationLocationData = {}
		result = destinationLocationAPI.json()
	#	qpylib.log(json.dumps(result, indent=2))
		destinationLocationData['longitude'] = result['longitude']
		destinationLocationData['latitude'] = result['latitude']
		#qpylib.log('longitude :: %s' % result['longitude'])
	#	qpylib.log('latitude :: %s' % result['latitude'])

	#	qpylib.log(json.dumps(destinationLocationData, indent = 2))
		return destinationLocationData

	except Exception as e:
		qpylib.log( "Error ///  "  + str(e), level='error' )
		return 'getLocationDataDest failed'
