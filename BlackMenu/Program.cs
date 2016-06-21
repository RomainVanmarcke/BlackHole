using Constellation;
using Constellation.Package;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace BlackMenu
{
    public class Program : PackageBase
    {
        static void Main(string[] args)
        {
            PackageHost.Start<Program>(args);
        }

        public override void OnStart()
        {
            PackageHost.PushStateObject("PackagesToTalk", new { DayInfo = false, ForecastIO = false, BatteryChecker = false, Plat = false });

            this.Acc.ValueChanged += (s, e) =>
            {
                if (Acc.DynamicValue.State == true)
                {
                    double x = (Acc.DynamicValue.X);
                    double y = (Acc.DynamicValue.Y);
                    double z = (Acc.DynamicValue.Z);
                    double xabs = Math.Abs(x);
                    double yabs = Math.Abs(y);
                    double zabs = Math.Abs(z);


                    if ((xabs + yabs < 1) && zabs >= 9 && zabs <= 11)
                    {
                        PackageHost.PushStateObject("PackagesToTalk", new { DayInfo = false, ForecastIO = false, BatteryChecker = false, Plat = true });
                    }
                    // Mouvement mise a plat : DayInfo
                    else if (xabs < 5 && yabs < 2 && zabs > 8)
                    {
                        PackageHost.PushStateObject("PackagesToTalk", new { DayInfo = true, ForecastIO = false, BatteryChecker = false, Plat = false });
                    }
                    // Mouvement quart gauche : ForecastIO
                    else if (x > 5 && y < 6 && zabs < 4)
                    {
                        PackageHost.PushStateObject("PackagesToTalk", new { DayInfo = false, ForecastIO = true, BatteryChecker = false, Plat = false });
                    }
                    // Mouvement quart droit : BatteryChecker
                    else if (x < (-5) && y < 6 && zabs < 4)
                    {
                        PackageHost.PushStateObject("PackagesToTalk", new { DayInfo = false, ForecastIO = false, BatteryChecker = true, Plat = false });
                    }
                    else
                    {
                        PackageHost.PushStateObject("PackagesToTalk", new { DayInfo = false, ForecastIO = false, BatteryChecker = false, Plat = false });
                    }
                }
            };


        }

        [StateObjectLink("ROMAIN-MSI", "BlackConnector", "accelerometer")]
        private StateObjectNotifier Acc { get; set; }
    }
}
