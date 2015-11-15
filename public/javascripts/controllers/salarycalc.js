var app = angular.module("busilyApp");

app.controller("SalaryCalc",
	["$scope", "$mdDialog", "$http", "RotaStorage", "localStorageService",

		function ($scope, $mdDialog, $http, RotaStorage, localStorageService) {

			$scope.rotaSummary = RotaStorage.getRotaStats();
			$scope.rotaSummary.firstDate = new Date($scope.rotaSummary.firstDate);
			$scope.rotaSummary.lastDate = new Date($scope.rotaSummary.lastDate);

			$scope.currentGrade = 0;
			$scope.currentPay = "FY1 - Min";
			$scope.currentPayValue = 0;
			$scope.currentPayAsGrade = 0;
			$scope.currentBand = "None";
			$scope.currentBandPercent = 0;
			$scope.currentBandValue = 0;
			$scope.currentDeanery = 0;
			$scope.currentOnCallAllowance = 0;
			$scope.currentOnCallAllowanceText = "";
			$scope.currentOnCallAllowanceValue = 0;
			$scope.currentSpecialty = "";
			$scope.currentSubSpecialty = "";
			$scope.currentPremia = 0;
			$scope.currentNode = "";
			$scope.currentNodePay = 0;
			$scope.currentLondonValue = 0;
			$scope.currentExtraHoursValue = {
				additionalBasicHours: 0,
				nightHours: 0,
				satHours: 0,
				sunHours: 0
			};

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
				"1A (50%)": 50,
				"1B (40%)": 40,
				"1C (20%)": 20,
				"2A (80%)": 80,
				"2B (50%)": 50,
				"3 (100%)": 100
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

				// old pay
				$scope.currentPayValue = $scope.existingPay[$scope.currentPay][1];
				$scope.currentPayAsGrade = $scope.grades[$scope.existingPay[$scope.currentPay][0]];

				// old pay banding

				if ($scope.currentBand != "None") {
					$scope.currentBandPercent = $scope.oldBands[$scope.currentBand];
					$scope.currentBandValue = ($scope.currentPayValue > 0) ? $scope.currentPayValue / 100 * $scope.currentBandPercent : 0;
				}

				// new basic pay
				$scope.currentNode = oldStageToNodes[$scope.currentGrade];
				$scope.currentNodePay = newPayNodes[$scope.currentNode];

				// on call allowance
				$scope.currentOnCallAllowanceValue = 0;
				$scope.currentOnCallAllowanceText = "None";
				if ($scope.rotaSummary.onCallDays > 0) {
					if ($scope.rotaSummary.onCallDays > 8) { // works fewer than 1 in 8 days
						$scope.currentOnCallAllowance = onCallAllowance[8];
						$scope.currentOnCallAllowanceText = onCallText[8];
					} else if ($scope.rotaSummary.onCallDays > 4) { // works more than 1 in 8, fewer than 1 in 4
						$scope.currentOnCallAllowance = onCallAllowance[4];
						$scope.currentOnCallAllowanceText = onCallText[4];
					} else { // works 1 in 4 or more frequently
						$scope.currentOnCallAllowance = onCallAllowance[0];
						$scope.currentOnCallAllowanceText = onCallText[0];
					}
					$scope.currentOnCallAllowanceValue = $scope.currentNodePay / 100 * $scope.currentOnCallAllowance;
				}

				// specialty training premia
				$scope.currentPremia = 0;
				if (payPremia[$scope.specialties[$scope.currentSpecialty]] != undefined) {
					if ($scope.currentGrade >= payPremia[$scope.specialties[$scope.currentSpecialty]][0]) {
						$scope.currentPremia = payPremia[$scope.specialties[$scope.currentSpecialty]][1];
					}
				}

				// London weighting
				$scope.currentLondonValue = 0;
				if (londonDeaneries[$scope.deaneries[$scope.currentDeanery]]) {
					$scope.currentLondonValue = londonWeighting;
				}

				// extra hours
				var hourlyBasic = $scope.currentNodePay / 40;
				$scope.currentExtraHoursValue = {
					additionalBasicHours: Math.min($scope.rotaSummary.weeklyStats.additionalRosteredHours, 8) * hourlyBasic, // max of 8
					nightHours: (hourlyBasic / 100 * 50) * $scope.rotaSummary.weeklyStats.nightHours,
					satHours: (hourlyBasic / 100 * 33) * $scope.rotaSummary.weeklyStats.saturdayHours,
					sunHours: (hourlyBasic / 100 * 33) * $scope.rotaSummary.weeklyStats.sundayHours
				};

				// current package
				$scope.currentPackage =
					$scope.currentPayValue +
					$scope.currentBandValue +
					$scope.currentLondonValue
				;
				// proposed package
				$scope.proposedPackage =
					$scope.currentNodePay +
					$scope.currentOnCallAllowanceValue +
					$scope.currentExtraHoursValue.additionalBasicHours +
					$scope.currentExtraHoursValue.nightHours +
					$scope.currentExtraHoursValue.satHours +
					$scope.currentExtraHoursValue.sunHours +
					$scope.currentPremia +
					$scope.currentLondonValue
				;

				$scope.differenceValue = $scope.proposedPackage - $scope.currentPackage;
				$scope.differencePercent = (1 - ($scope.currentPackage / $scope.proposedPackage)) * 100;
				$scope.differenceStyle = ($scope.differenceValue < 0) ? 'worse' : 'better';

			};
		}
	]);
