var app = angular.module("busilyApp");

app.controller("SalaryCalc",
	["$scope", "$mdDialog", "$http", "RotaStorage", "localStorageService",

		function ($scope, $mdDialog, $http, RotaStorage, localStorageService) {

			$scope.rotaSummary = RotaStorage.getRotaStats();
			$scope.rotaSummary.firstDate = new Date($scope.rotaSummary.firstDate);
			$scope.rotaSummary.lastDate = new Date($scope.rotaSummary.lastDate);

			$scope.calculated = RotaStorage.getCalculatedSalary();

			if ($scope.calculated.grade == undefined) {

				$scope.calculated.grade = 0;
				$scope.calculated.Pay = "FY1 - Min";
				$scope.calculated.PayValue = 0;
				$scope.calculated.PayAsGrade = 0;
				$scope.calculated.Band = "None";
				$scope.calculated.BandPercent = 0;
				$scope.calculated.BandValue = 0;
				$scope.calculated.FullTime = 100;
				$scope.calculated.Deanery = 0;
				$scope.calculated.OnCallAllowance = 0;
				$scope.calculated.OnCallAllowanceText = "";
				$scope.calculated.OnCallAllowanceValue = 0;
				$scope.calculated.Specialty = "";
				$scope.calculated.SubSpecialty = "";
				$scope.calculated.Premia = 0;
				$scope.calculated.Node = "";
				$scope.calculated.NodePay = 0;
				$scope.calculated.LondonValue = 0;
				$scope.calculated.ExtraHoursValue = {
					additionalBasicHours: 0,
					nightHours: 0,
					satHours: 0,
					sunHours: 0
				};

			}

			$scope.grades = [
				"FY1",
				"FY2",
				"ST1/CT1/GP1",
				"ST2/CT2/GP2",
				"ST3/CT3/GP3",
				"ST4",
				"ST5",
				"ST6",
				"ST7"
			];
			$scope.existingPay = {
				"FY1 - Min": [0, 22636], // first value is index in 'grades' array, 0 = "FY1"
				"FY1 - Scale 1": [0, 24049],
				"FY1 - Scale 2": [0, 25461],
				"FY2 - Min": [1, 28076],
				"FY2 - Scale 1": [1, 29912],
				"FY2 - Scale 2": [1, 31748],
				"ST1/CT1/GP1": [2, 30002],
				"ST2/CT2/GP2": [3, 31838],
				"ST3/CT3/GP3": [4, 34402],
				"ST4": [5, 35952],
				"ST5": [6, 37822],
				"ST6": [7, 39693],
				"ST7": [8, 41564],
				"ST8": [9, 43434],
				"ST9:": [9, 45304],
				"ST10:": [9, 47174]
			};
			$scope.oldBands = {
				"None": 0,
				"Full-Time GP Banding (45%)": 45,
				"Full-Time BAND 1C (20%)": 20,
				"Full-Time BAND 1B (40%)": 40,
				"Full-Time BAND 1A (50%)": 50,
				"Full-Time BAND 2B (50%)": 50,
				"Full-Time BAND 2A (80%)": 80,
				"Full-Time BAND 3 (100%)": 100,
				"Less than full time BAND FC (20%)": 20,
				"Less than full time BAND FB (40%)": 40,
				"Less than full time BAND FA (50%)": 50
			};
			$scope.specialties = [
				"Foundation Programme",
				"Core Training",
				"Anaesthesia",
				"Community sexual and reproductive health",
				"Emergency medicine",
				"General practice (GP)",
				"Intensive care medicine",
				"Medicine",
				"Obstetrics and gynaecology",
				"Occupational medicine",
				"Ophthalmology",
				"Paediatrics",
				"Pathology",
				"Psychiatry",
				"Public health",
				"Radiology",
				"Surgery"
			];
			$scope.subSpecialties = {
				"Core Training": [
					"ACCS (Acute Medicine)",
					"ACCS (Emergency Medicine)",
					"ACCS (Anaesthesia)",
					"Broad-based Training",
					"Core Anaesthesia",
					"Core Medical Training",
					"Core Psychiatry Training",
					"Core Surgical Training"
				],
				"Medicine": [
					"Acute internal medicine",
					"Allergy",
					"Audiovestibular medicine",
					"Cardiology",
					"Clinical genetics",
					"Clinical neurophysiology",
					"Clinical pharmacology and therapeutics",
					"Dermatology",
					"Endocrinology and diabetes",
					"Gastroenterology",
					"General internal medicine",
					"Genitourinary medicine",
					"Geriatric medicine",
					"Immunology",
					"Infectious diseases",
					"Medical oncology",
					"Medical ophthalmology",
					"Neurology",
					"Nuclear medicine",
					"Palliative medicine",
					"Pharmaceutical medicine",
					"Rehabilitation medicine",
					"Renal medicine",
					"Respiratory medicine",
					"Rheumatology",
					"Sport and exercise medicine",
					"Tropical medicine"
				],
				"Paediatrics": [
					"Paediatric cardiology",
					"Paediatrics"
				],
				"Pathology": [
					"Chemical pathology",
					"Haematology",
					"Histopathology",
					"Medical microbiology and virology"
				],
				"Psychiatry": [
					"Child and adolescent psychiatry",
					"Forensic psychiatry",
					"General adult psychiatry",
					"Liaison psychiatry",
					"Medical psychotherapy",
					"Old age psychiatry",
					"Psychiatry of intellectual disability (PID)"
				],
				"Radiology": [
					"Clinical oncology",
					"Clinical radiology"
				],
				"Surgery": [
					"Cardiothoracic surgery",
					"General surgery",
					"Neurosurgery",
					"Oral and maxillofacial surgery",
					"Otorhinolaryngology (ENT)",
					"Paediatric surgery",
					"Plastic surgery",
					"Trauma and orthopaedic surgery",
					"Urology",
					"Vascular surgery"
				]
			};
			$scope.deaneries = [
				"North East",
				"North West",
				"Yorkshire and the Humber",
				"East Midlands",
				"West Midlands",
				"East of England",
				"Thames Valley",
				"Kent, Surrey and Sussex",
				"Wessex",
				"South West",
				"North Central and East London",
				"North West London",
				"South London"
			];
			$scope.fulltime = {
				"Full-time (100%)": 100,
				"Less than full time - F5: 20-23.9hrs/wk (50-59% of full time)": 50,
				"Less than full time - F6: 24-27.9hrs/wk (60-69% of full time)": 60,
				"Less than full time - F7: 28-31.9hrs/wk (70-79% of full time)": 70,
				"Less than full time - F8: 32-35.9hrs/wk (80-89% of full time)": 80,
				"Less than full time - F9: 36-39.9hrs/wk (90-99% of full time)": 90
			};

			var londonDeaneries = {
				"North Central and East London": true,
				"North West London": true,
				"South London": true
			};

			var oldStageToNodes = [
				"FY1",
				"FY2",
				"Registrar 1",
				"Registrar 1",
				"Registrar 2",
				"Registrar 2",
				"Registrar 3",
				"Registrar 3",
				"Registrar 4",
				"Registrar 4"
			];
			var newPayNodes = {
				"FY1": 25500,
				"FY2": 31600,
				"Registrar 1": 37400,
				"Registrar 2": 42500,
				"Registrar 3": 48400,
				"Registrar 4": 55000
			};
			var onCallAllowance = {
				8: 2, // # on call days / total days > 8 = 2%
				4: 4, // # on call days / total days > 4 = 4%
				0: 6  // # on call days / total days > 0 = 6%
			};
			var onCallText = {
				8: "Less than 1:8",
				4: "Less than 1:4 up to 1:8",
				0: "1:4 or more frequently"
			};
			var londonWeighting = 2162;
			var payPremia = {
				"General practice (GP)": [2, 8200], // first value is index in 'grades' array: 2 = "ST1/CT1/GP1"
				"Emergency medicine": [5, 1500], // 5 = "ST4"
				"Psychiatry": [2, 1500]  // 2 = "ST1/CT1/GP1"
			};

			$scope.recalculate = function () {

				// fraction of full-time
				//$scope.calculated.FullTime;

				// old pay
				$scope.calculated.PayValue = $scope.existingPay[$scope.calculated.Pay][1] / 100 * $scope.calculated.FullTime;
				$scope.calculated.PayAsGrade = $scope.grades[$scope.existingPay[$scope.calculated.Pay][0]];

				// old pay banding

				if ($scope.calculated.Band != "None") {
					$scope.calculated.BandPercent = $scope.oldBands[$scope.calculated.Band];
					$scope.calculated.BandValue = ($scope.calculated.PayValue > 0) ? $scope.calculated.PayValue / 100 * $scope.calculated.BandPercent : 0;
				}

				// new basic pay
				$scope.calculated.Node = oldStageToNodes[$scope.calculated.grade];
				$scope.calculated.NodePay = newPayNodes[$scope.calculated.Node] / 100 * $scope.calculated.FullTime;

				// on call allowance
				$scope.calculated.OnCallAllowance = 0;
				$scope.calculated.OnCallAllowanceValue = 0;
				$scope.calculated.OnCallAllowanceText = "None";
				if ($scope.rotaSummary.onCallDays > 0) {
					if ($scope.rotaSummary.onCallDays > 8) { // works fewer than 1 in 8 days
						$scope.calculated.OnCallAllowance = onCallAllowance[8];
						$scope.calculated.OnCallAllowanceText = onCallText[8];
					} else if ($scope.rotaSummary.onCallDays > 4) { // works more than 1 in 8, fewer than 1 in 4
						$scope.calculated.OnCallAllowance = onCallAllowance[4];
						$scope.calculated.OnCallAllowanceText = onCallText[4];
					} else { // works 1 in 4 or more frequently
						$scope.calculated.OnCallAllowance = onCallAllowance[0];
						$scope.calculated.OnCallAllowanceText = onCallText[0];
					}
					$scope.calculated.OnCallAllowanceValue = $scope.calculated.NodePay / 100 * $scope.calculated.OnCallAllowance;
				}

				// specialty training premia
				$scope.calculated.Premia = 0;
				if (payPremia[$scope.specialties[$scope.calculated.Specialty]] != undefined) {
					if ($scope.calculated.grade >= payPremia[$scope.specialties[$scope.calculated.Specialty]][0]) {
						$scope.calculated.Premia = payPremia[$scope.specialties[$scope.calculated.Specialty]][1]  / 100 * $scope.calculated.FullTime;
					}
				}

				// London weighting
				$scope.calculated.LondonValue = 0;
				if (londonDeaneries[$scope.deaneries[$scope.calculated.Deanery]]) {
					$scope.calculated.LondonValue = londonWeighting  / 100 * $scope.calculated.FullTime;
				}

				// extra hours
				var hourlyBasic = $scope.calculated.NodePay / 40;
				$scope.calculated.ExtraHoursValue = {
					additionalBasicHours: Math.min($scope.rotaSummary.weeklyStats.additionalRosteredHours, 8) * hourlyBasic, // max of 8
					nightHours: (hourlyBasic / 100 * 50) * $scope.rotaSummary.weeklyStats.nightHours,
					satHours: (hourlyBasic / 100 * 33) * $scope.rotaSummary.weeklyStats.saturdayHours,
					sunHours: (hourlyBasic / 100 * 33) * $scope.rotaSummary.weeklyStats.sundayHours
				};

				// current package
				$scope.calculated.Package =
					$scope.calculated.PayValue +
					$scope.calculated.BandValue +
					$scope.calculated.LondonValue
				;
				// proposed package
				$scope.calculated.proposedPackage =
					$scope.calculated.NodePay +
					$scope.calculated.OnCallAllowanceValue +
					$scope.calculated.ExtraHoursValue.additionalBasicHours +
					$scope.calculated.ExtraHoursValue.nightHours +
					$scope.calculated.ExtraHoursValue.satHours +
					$scope.calculated.ExtraHoursValue.sunHours +
					$scope.calculated.Premia +
					$scope.calculated.LondonValue
				;

				$scope.calculated.differenceValue = $scope.calculated.proposedPackage - $scope.calculated.Package;
				$scope.calculated.differencePercent = (1 - ($scope.calculated.Package / $scope.calculated.proposedPackage)) * 100;
				$scope.calculated.differenceStyle = ($scope.calculated.differenceValue < 0) ? 'worse' : 'better';

				RotaStorage.setCalculatedSalary($scope.calculated);
				console.log($scope.calculated);
			};

			$scope.recalculate();
		}
	]);
