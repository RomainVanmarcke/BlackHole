using Constellation;
using Constellation.Package;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlackInfo
{
    public class Program : PackageBase
    {
        static void Main(string[] args)
        {
            PackageHost.Start<Program>(args);
        }

        public override void OnStart()
        {
            PackageHost.WriteInfo("Package starting - IsRunning: {0} - IsConnected: {1}", PackageHost.IsRunning, PackageHost.IsConnected);
        }


        [StateObjectLink("ROMAIN-MSI", "BatteryChecker", "C1E768DC32A8DE4F932520D74134C3F4716C12D0")]
        private StateObjectNotifier bat { get; set; }
        [StateObjectLink("ROMAIN-MSI", "HWMonitor", "/hdd/0/temperature/0")]
        private StateObjectNotifier hard { get; set; }
        [StateObjectLink("ROMAIN-MSI", "HWMonitor", "/intelcpu/0/load/0")]
        private StateObjectNotifier hard2 { get; set; }
        [StateObjectLink("ROMAIN-MSI", "ForecastIO", "Lille")]
        private StateObjectNotifier meteo { get; set; }
        [StateObjectLink("ROMAIN-MSI", "DayInfo", "NameDay")]
        private StateObjectNotifier nameday { get; set; }
        [StateObjectLink("ROMAIN-MSI", "DayInfo", "SunInfo")]
        private StateObjectNotifier suninfo { get; set; }

        //[MessageCallback(IsHidden = true)]
        private string Requete(string pack)
        {
            string text = "";
            switch (pack)
            {
                case "BatteryChecker":
                    text = batterie();
                    break;
                case "ForecastIO":
                    string resume = tempsbdd();
                    text = $"il fait {meteo.DynamicValue.currently.temperature}° à {meteo.Value.Name} , {resume}. ";
                    break;
                case "HWMonitor":
                    text = $"la temperature du disque hdd est {hard.DynamicValue.Value} {hard.DynamicValue.Unit}, l'utilisation du processeur est {Math.Round(System.Convert.ToDouble(hard2.DynamicValue.Value), 2)} {hard2.DynamicValue.Unit}. ";
                    break;
                case "DayInfo":
                    text = dayInfo();
                    break;
            }

            return text;

        }
        private enum quiparle { tel, pc, none };
        [MessageCallback]
        private void Morning(quiparle qui)
        {
            int i = 0;
            dynamic morningPack = PackageHost.GetSettingAsJsonObject("morningPack");
            string annonce = "";
            foreach (string pack in morningPack)
            {
                i++;
                annonce += Requete(pack);
            }
            if (i == 0)
            {
                annonce = "Vous n'avez configuré aucun package";
                PackageHost.SendMessage(MessageScope.Create("ROMAIN-MSI/MessageCallback"), "MyMessage", new object[] { annonce, PackageHost.GetSettingValue<int>("volume"), PackageHost.GetSettingValue<int>("vitesse") });
            }
            PackageHost.PushStateObject("Morning", new { message = annonce, source = qui });
        }

        private string dayInfo()
        {
            string fete = "";
            if (nameday.DynamicValue.Contains("Ste"))
            {
                fete = nameday.DynamicValue.Remove(0, 4);
                //fete.Remove(0, 4);
                return $"Aujourd'hui c'est la sainte {fete}, le soleil se lève à {suninfo.DynamicValue.Sunrise} et se couche à {suninfo.DynamicValue.Sunset}. ";
            }
            else
            {
                fete = nameday.DynamicValue.Remove(0, 3);
                //fete.Remove(0, 3);
                return $"Aujourd'hui c'est la saint {fete}, le soleil se lève à {suninfo.DynamicValue.Sunrise} et se couche à {suninfo.DynamicValue.Sunset}. ";
            }
        }
        private string batterie()
        {
            if (bat.DynamicValue.StatusLabel == "Plugged to AC")
            {
                return $"l'ordinateur est branché sur secteur, la batterie est chargée à {bat.DynamicValue.EstimatedChargeRemaining}% ";
            }
            else
            {
                return $"L'ordinateur se décharge, il vous reste {bat.DynamicValue.EstimatedChargeRemaining}% de batterie ";
            }
        }

        private string tempsbdd()
        {
            string s = meteo.DynamicValue.currently.summary;
            string c = "";
            if (s.Contains("Mostly Cloudy"))
            {
                c = "Mostly Cloudy";
                return $"Le temps est plutôt nuageux {tempsbdd2(c)}";
            }
            else if (s.Contains("Overcast"))
            {
                c = "Overcast";
                return $"Le temps est couvert {tempsbdd2(c)}";
            }
            else if (s.Contains("Drizzle"))
            {
                c = "Drizzle";
                return $"il y a une légère bruine {tempsbdd2(c)}";
            }
            else if (s.Contains("Foggy"))
            {
                c = "Foggy";
                return $"Il y a du brouillard à couper au couteau {tempsbdd2(c)}";
            }
            else if (s.Contains("Breezy"))
            {
                c = "Breezy";
                return $"Il y a beaucoup de vent {tempsbdd2(c)}";
            }
            else if (s.Contains("Clear"))
            {
                c = "Clear";
                return $"Le ciel est dégagé {tempsbdd2(c)}";
            }
            else if (s.Contains("Partly Cloudy"))
            {
                c = "Partly Cloudy";
                return $"Le ciel est partiellement couvert {tempsbdd2(c)}";
            }
            else if (s.Contains("Light Rain"))
            {
                c = "Light Rain";
                return "Il pleut légèrement";
            }
            else
            {
                return meteo.DynamicValue.currently.summary;
            }
        }
        private string tempsbdd2(string chaine)
        {
            string s = meteo.DynamicValue.currently.summary;
            if (s.Contains("Mostly Cloudy") && chaine != "Mostly Cloudy")
            {
                return "Et le temps est plutôt nuageux. ";
            }
            else if (s.Contains("Overcast") && chaine != "Overcast")
            {
                return "Et le temps est couvert. ";
            }
            else if (s.Contains("Drizzle") && chaine != "Drizzle")
            {
                return "Et il y a une légère bruine. ";
            }
            else if (s.Contains("Foggy") && chaine != "Foggy")
            {
                return "Et il y a du brouillard à couper au couteau. ";
            }
            else if (s.Contains("Breezy") && chaine != "Breezy")
            {
                return "Et il y a beaucoup de vent. ";
            }
            else if (s.Contains("Clear") && chaine != "Clear")
            {
                return $" Le ciel est dégagé";
            }
            else if (s.Contains("Partly Cloudy") && chaine != "Partly Cloudy")
            {
                return "Et le ciel est partiellement couvert. ";
            }
            else if (s.Contains("Light Rain") && chaine != "Light Rain")
            {
                return " Et il pleut légèrement. ";
            }
            else
            {
                return "";
            }
        }
    }
}
